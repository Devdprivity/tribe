<?php

namespace App\Http\Controllers;

use App\Models\LiveStream;
use App\Models\StreamParticipant;
use App\Services\StreamingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LiveStreamController extends Controller
{
    public function __construct(
        private StreamingService $streamingService
    ) {}

    /**
     * Mostrar lista de streams (OPTIMIZADO para Octane)
     */
    public function index(Request $request)
    {
        try {
            $filters = $request->only(['category', 'language', 'status', 'search']);
            
            $streams = LiveStream::with([
                        'streamer:id,username,full_name,avatar',
                        'participants' => function($query) {
                            $query->active()->count();
                        }
                    ])
                    ->public()
                    ->when($filters['category'] ?? null, fn($q, $cat) => $q->byCategory($cat))
                    ->when($filters['language'] ?? null, fn($q, $lang) => $q->byLanguage($lang))
                    ->when($filters['status'] ?? null, function($q, $status) {
                        if ($status === 'live') {
                            $q->live();
                        } elseif ($status === 'scheduled') {
                            $q->scheduled();
                        }
                    })
                    ->when($filters['search'] ?? null, function($q, $search) {
                        $q->where(function($query) use ($search) {
                            $query->where('title', 'like', "%{$search}%")
                                  ->orWhere('description', 'like', "%{$search}%")
                                  ->orWhereHas('streamer', function($q) use ($search) {
                                      $q->where('username', 'like', "%{$search}%")
                                        ->orWhere('full_name', 'like', "%{$search}%");
                                  });
                        });
                    })
                    ->orderByRaw("CASE WHEN status = 'live' THEN 1 ELSE 2 END")
                    ->orderBy('current_viewers', 'desc')
                    ->orderBy('scheduled_at', 'desc')
                    ->paginate(12);

            $categories = $this->getStreamCategories();
            $languages = $this->getProgrammingLanguages();

            return Inertia::render('Streaming/Index', [
                'streams' => $streams,
                'categories' => $categories,
                'languages' => $languages,
                'filters' => $filters,
                'stats' => [
                    'live_streams' => LiveStream::live()->count(),
                    'total_viewers' => LiveStream::live()->sum('current_viewers'),
                    'scheduled_today' => LiveStream::scheduled()
                                                  ->whereDate('scheduled_at', today())
                                                  ->count(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load streams', [
                'error' => $e->getMessage(),
                'filters' => $filters ?? []
            ]);

            return back()->withErrors(['error' => 'Error al cargar los streams']);
        }
    }

    /**
     * Mostrar stream individual
     */
    public function show(LiveStream $stream)
    {
        try {
            // Verificar permisos de acceso
            if (!$this->streamingService->canUserView(Auth::user(), $stream)) {
                return redirect()->route('streaming.index')
                               ->withErrors(['error' => 'No tienes permiso para ver este stream']);
            }

            $stream->load([
                'streamer:id,username,full_name,avatar,bio',
                'participants.user:id,username,full_name,avatar',
                'messages.user:id,username,full_name,avatar',
                'collaborativeSession',
                'analytics' => function($query) {
                    $query->where('date', today())->orderBy('hour', 'desc')->take(12);
                }
            ]);

            // Agregar usuario como participante si está autenticado
            $participant = null;
            if (Auth::check() && $stream->status === 'live') {
                $participant = $this->streamingService->joinStream(Auth::user(), $stream);
            }

            return Inertia::render('Streaming/Watch', [
                'stream' => $stream,
                'participant' => $participant,
                'can_collaborate' => $stream->can_collaborate,
                'websocket_url' => config('broadcasting.connections.pusher.app_id') ? 
                                 config('app.websocket_url') : null,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load stream', [
                'stream_id' => $stream->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return redirect()->route('streaming.index')
                           ->withErrors(['error' => 'Error al cargar el stream']);
        }
    }

    /**
     * Crear nuevo stream
     */
    public function create()
    {
        return Inertia::render('Streaming/Create', [
            'categories' => $this->getStreamCategories(),
            'languages' => $this->getProgrammingLanguages(),
        ]);
    }

    /**
     * Guardar nuevo stream
     */
    public function store(Request $request)
    {
        try {
            Log::info('Stream creation request received', [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string|max:2000',
                'category' => 'required|string|in:' . implode(',', array_keys($this->getStreamCategories())),
                'programming_language' => 'nullable|string|in:' . implode(',', array_keys($this->getProgrammingLanguages())),
                'tags' => 'nullable|array|max:10',
                'tags.*' => 'string|max:50',
                'privacy' => 'required|in:public,unlisted,private',
                'scheduled_at' => 'nullable|date|after:now',
                'max_participants' => 'nullable|integer|min:1|max:100',
                'allow_chat' => 'nullable|boolean',
                'allow_code_collaboration' => 'nullable|boolean',
                'allow_screen_control' => 'nullable|boolean',
                'tips_enabled' => 'nullable|boolean',
                'min_tip_amount' => 'nullable|numeric|min:0.01|max:1000',
                'subscribers_only' => 'nullable|boolean',
                'auto_record' => 'nullable|boolean',
            ]);

            // Establecer valores por defecto
            $validated['max_participants'] = $validated['max_participants'] ?? 100;
            $validated['allow_chat'] = $validated['allow_chat'] ?? true;
            $validated['allow_code_collaboration'] = $validated['allow_code_collaboration'] ?? false;
            $validated['allow_screen_control'] = $validated['allow_screen_control'] ?? false;
            $validated['tips_enabled'] = $validated['tips_enabled'] ?? false;
            $validated['subscribers_only'] = $validated['subscribers_only'] ?? false;
            $validated['auto_record'] = $validated['auto_record'] ?? false;

            Log::info('Stream validation successful', ['validated_data' => $validated]);

            $stream = $this->streamingService->createStream(Auth::user(), $validated);

            Log::info('Stream created successfully', [
                'stream_id' => $stream->id,
                'title' => $stream->title,
                'status' => $stream->status
            ]);

            return response()->json([
                'success' => true,
                'id' => $stream->id,
                'stream_id' => $stream->id,
                'stream_key' => $stream->stream_key,
                'status' => $stream->status,
                'title' => $stream->title,
                'redirect' => $stream->status === 'scheduled' 
                    ? route('streaming.stream.dashboard', $stream->id)
                    : route('streaming.show', $stream->id)
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Stream validation failed', [
                'user_id' => Auth::id(),
                'errors' => $e->errors(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Datos de validación incorrectos',
                'validation_errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Stream creation failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al crear el stream: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dashboard del streamer
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        $streams = LiveStream::where('streamer_id', $user->id)
                           ->with(['participants', 'analytics'])
                           ->orderBy('created_at', 'desc')
                           ->paginate(10);

        $stats = [
            'total_streams' => LiveStream::where('streamer_id', $user->id)->count(),
            'live_streams' => LiveStream::where('streamer_id', $user->id)->live()->count(),
            'total_viewers' => LiveStream::where('streamer_id', $user->id)->sum('peak_viewers'),
            'total_earnings' => $user->streamTips()->where('status', 'completed')->sum('amount'),
            'subscribers' => $user->subscribers()->where('status', 'active')->count(),
        ];

        return Inertia::render('Streaming/Dashboard/Index', [
            'streams' => $streams,
            'stats' => $stats,
        ]);
    }

    /**
     * Panel de control individual del stream
     */
    public function dashboardShow(LiveStream $stream)
    {
        Gate::authorize('manage', $stream);

        $stream->load([
            'participants.user:id,username,full_name,avatar',
            'messages' => function($query) {
                $query->latest()->take(50);
            },
            'tips' => function($query) {
                $query->where('status', 'completed')->latest()->take(20);
            },
            'analytics' => function($query) {
                $query->where('date', '>=', now()->subDays(7))->orderBy('date');
            }
        ]);

        return Inertia::render('Streaming/Dashboard/Show', [
            'stream' => $stream,
            'can_start' => $stream->status === 'scheduled',
            'can_end' => $stream->status === 'live',
        ]);
    }

    /**
     * Iniciar stream
     */
    public function start(LiveStream $stream)
    {
        try {
            Gate::authorize('manage', $stream);

            if ($stream->status !== 'scheduled') {
                return response()->json([
                    'success' => false,
                    'error' => 'El stream no puede ser iniciado en su estado actual'
                ], 400);
            }

            $this->streamingService->startStream($stream);

            return response()->json([
                'success' => true,
                'message' => 'Stream iniciado exitosamente',
                'stream_url' => route('streaming.show', $stream)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to start stream', [
                'stream_id' => $stream->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al iniciar el stream'
            ], 500);
        }
    }

    /**
     * Terminar stream
     */
    public function end(LiveStream $stream)
    {
        try {
            Gate::authorize('manage', $stream);

            if ($stream->status !== 'live') {
                return response()->json([
                    'success' => false,
                    'error' => 'El stream no está actualmente en vivo'
                ], 400);
            }

            $this->streamingService->endStream($stream);

            return response()->json([
                'success' => true,
                'message' => 'Stream terminado exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to end stream', [
                'stream_id' => $stream->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al terminar el stream'
            ], 500);
        }
    }

    /**
     * Unirse a un stream
     */
    public function join(Request $request, LiveStream $stream)
    {
        try {
            if (!Auth::check()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Debes iniciar sesión para unirte'
                ], 401);
            }

            if (!$this->streamingService->canUserJoin(Auth::user(), $stream)) {
                return response()->json([
                    'success' => false,
                    'error' => 'No puedes unirte a este stream'
                ], 403);
            }

            $participant = $this->streamingService->joinStream(Auth::user(), $stream);

            return response()->json([
                'success' => true,
                'participant' => $participant,
                'message' => 'Te has unido al stream exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to join stream', [
                'stream_id' => $stream->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error al unirse al stream'
            ], 500);
        }
    }

    /**
     * Salir de un stream
     */
    public function leave(LiveStream $stream)
    {
        try {
            if (!Auth::check()) {
                return response()->json(['success' => true]);
            }

            $this->streamingService->leaveStream(Auth::user(), $stream);

            return response()->json([
                'success' => true,
                'message' => 'Has salido del stream'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to leave stream', [
                'stream_id' => $stream->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json(['success' => true]); // No fallar silenciosamente
        }
    }

    // Private helper methods

    private function getStreamCategories(): array
    {
        return [
            'coding' => 'Programación en Vivo',
            'tutorial' => 'Tutoriales',
            'code_review' => 'Revisión de Código',
            'debugging' => 'Debugging',
            'interview_prep' => 'Preparación de Entrevistas',
            'project_building' => 'Construcción de Proyectos',
            'algorithm_practice' => 'Práctica de Algoritmos',
            'web_development' => 'Desarrollo Web',
            'mobile_development' => 'Desarrollo Móvil',
            'data_science' => 'Ciencia de Datos',
            'devops' => 'DevOps',
            'game_development' => 'Desarrollo de Juegos',
            'other' => 'Otros',
        ];
    }

    private function getProgrammingLanguages(): array
    {
        return [
            'javascript' => 'JavaScript',
            'typescript' => 'TypeScript',
            'python' => 'Python',
            'java' => 'Java',
            'csharp' => 'C#',
            'cpp' => 'C++',
            'c' => 'C',
            'php' => 'PHP',
            'ruby' => 'Ruby',
            'go' => 'Go',
            'rust' => 'Rust',
            'swift' => 'Swift',
            'kotlin' => 'Kotlin',
            'dart' => 'Dart',
            'html' => 'HTML',
            'css' => 'CSS',
            'sql' => 'SQL',
            'bash' => 'Bash',
            'other' => 'Otros',
        ];
    }
}