<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Post;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Exception;

class ChannelController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $channels = Channel::with(['creator', 'members'])
                ->withCount('members as members_count_calc')
                ->when($request->type, fn($query, $type) => $query->where('type', $type))
                ->when($request->search, fn($query, $search) => $query->search($search))
                ->when($request->my_channels, function ($query) {
                    return $query->whereHas('members', function ($q) {
                        $q->where('user_id', Auth::id());
                    });
                })
                ->public()
                ->latest()
                ->paginate(12);

            $my_channels = Auth::check() 
                ? Channel::whereHas('members', fn($q) => $q->where('user_id', Auth::id()))->get()
                : collect();

            $trending_channels = Channel::withCount('members as members_count_calc')
                ->orderBy('members_count_calc', 'desc')
                ->take(10)
                ->get();

            return Inertia::render('channels', [
                'channels' => $channels,
                'filters' => $request->only('type', 'search', 'my_channels'),
                'my_channels' => $my_channels,
                'trending_channels' => $trending_channels,
            ]);
        } catch (Exception $e) {
            Log::error('Error loading channels index', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            
            return Inertia::render('channels', [
                'channels' => collect(),
                'filters' => $request->only('type', 'search', 'my_channels'),
                'my_channels' => collect(),
                'trending_channels' => collect(),
            ])->with('error', 'Error al cargar los canales. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('channels/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'type' => 'required|in:technology,level,industry,location',
                'avatar' => 'nullable|url',
                'is_private' => 'boolean',
            ]);

            DB::beginTransaction();

            $channel = Channel::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'],
                'avatar' => $validated['avatar'] ?? null,
                'is_private' => $validated['is_private'] ?? false,
                'created_by' => Auth::id(),
            ]);

            $channel->addMember(Auth::user(), 'admin');

            DB::commit();

            return redirect()->route('channels.show', $channel)
                ->with('success', 'Canal creado exitosamente');

        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput()
                ->with('error', 'Por favor, corrige los errores en el formulario.');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error creating channel', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->withInput()
                ->with('error', 'Error al crear el canal. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Channel $channel)
    {
        try {
            if ($channel->is_private && Auth::guest()) {
                return redirect()->route('login')
                    ->with('error', 'Debes iniciar sesión para acceder a este canal privado.');
            }

            if ($channel->is_private && Auth::check() && !$channel->hasMember(Auth::user())) {
                return redirect()->route('channels.index')
                    ->with('error', 'No tienes acceso a este canal privado.');
            }

            $channel->load(['creator', 'members']);

            $posts = Post::with(['user', 'comments.user'])
                ->withCount('comments as comments_count_calc')
                ->where('channel_id', $channel->id)
                ->latest()
                ->paginate(10);

            $isMember = Auth::check() && $channel->hasMember(Auth::user());
            $memberRole = null;

            if ($isMember) {
                $membership = $channel->members()->where('user_id', Auth::id())->first();
                $memberRole = $membership ? $membership->pivot->role : null;
            }

            return Inertia::render('channels/show', [
                'channel' => $channel,
                'posts' => $posts,
                'isMember' => $isMember,
                'memberRole' => $memberRole,
                'canModerate' => Auth::check() && $channel->canModerate(Auth::user()),
            ]);
        } catch (Exception $e) {
            Log::error('Error loading channel', [
                'channel_id' => $channel->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);
            
            return redirect()->route('channels.index')
                ->with('error', 'Error al cargar el canal.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Channel $channel)
    {
        Gate::authorize('update', $channel);

        return Inertia::render('channels/edit', [
            'channel' => $channel,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Channel $channel)
    {
        Gate::authorize('update', $channel);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:technology,level,industry,location',
            'avatar' => 'nullable|url',
            'is_private' => 'boolean',
        ]);

        $channel->update([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'avatar' => $request->avatar,
            'is_private' => $request->is_private ?? false,
        ]);

        return redirect()->route('channels.show', $channel)
            ->with('success', '¡Canal actualizado exitosamente!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Channel $channel)
    {
        Gate::authorize('delete', $channel);

        $channel->delete();

        return redirect()->route('channels.index')
            ->with('success', '¡Canal eliminado exitosamente!');
    }

    /**
     * Join a channel
     */
    public function join(Channel $channel)
    {
        try {
            $user = Auth::user();

            if ($channel->is_private) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes unirte a un canal privado sin invitación.'
                ], 403);
            }

            if ($channel->hasMember($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya eres miembro de este canal.'
                ], 400);
            }

            DB::beginTransaction();

            $channel->addMember($user);
            $this->notificationService->channelJoined($user, $channel);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Te has unido al canal exitosamente',
                'isMember' => true
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error joining channel', [
                'channel_id' => $channel->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al unirse al canal. Inténtalo de nuevo.'
            ], 500);
        }
    }

    /**
     * Leave a channel
     */
    public function leave(Channel $channel)
    {
        try {
            $user = Auth::user();

            if (!$channel->hasMember($user)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No eres miembro de este canal.'
                ], 400);
            }

            if ($channel->created_by === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'El creador del canal no puede abandonarlo.'
                ], 400);
            }

            $channel->removeMember($user);

            return response()->json([
                'success' => true,
                'message' => 'Has abandonado el canal exitosamente',
                'isMember' => false
            ]);

        } catch (Exception $e) {
            Log::error('Error leaving channel', [
                'channel_id' => $channel->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al abandonar el canal. Inténtalo de nuevo.'
            ], 500);
        }
    }

    /**
     * Invite user to private channel
     */
    public function inviteUser(Request $request, Channel $channel)
    {
        Gate::authorize('moderate', $channel);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:member,moderator,admin',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($channel->hasMember($user)) {
            return back()->with('error', 'El usuario ya es miembro del canal.');
        }

        $channel->addMember($user, $request->role);

        return back()->with('success', '¡Usuario invitado exitosamente!');
    }

    /**
     * Remove user from channel
     */
    public function removeUser(Request $request, Channel $channel)
    {
        Gate::authorize('moderate', $channel);

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);

        if (!$channel->hasMember($user)) {
            return back()->with('error', 'El usuario no es miembro del canal.');
        }

        // No puede remover al creador del canal
        if ($channel->created_by === $user->id) {
            return back()->with('error', 'No puedes remover al creador del canal.');
        }

        $channel->removeMember($user);

        return back()->with('success', '¡Usuario removido del canal exitosamente!');
    }

    /**
     * Update user role in channel
     */
    public function updateUserRole(Request $request, Channel $channel)
    {
        Gate::authorize('moderate', $channel);

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:member,moderator,admin',
        ]);

        $user = User::findOrFail($request->user_id);

        if (!$channel->hasMember($user)) {
            return back()->with('error', 'El usuario no es miembro del canal.');
        }

        $channel->updateMemberRole($user, $request->role);

        return back()->with('success', '¡Rol del usuario actualizado exitosamente!');
    }

    /**
     * Get channel members
     */
    public function members(Channel $channel)
    {
        Gate::authorize('view', $channel);

        $members = $channel->members()->with(['user'])->paginate(20);

        return Inertia::render('channels/members', [
            'channel' => $channel,
            'members' => $members,
        ]);
    }

    /**
     * Search channels
     */
    public function search(Request $request)
    {
        try {
            $query = trim($request->query('q'));

            if (empty($query) || strlen($query) < 2) {
                return response()->json([]);
            }

            $channels = Channel::search($query)
                ->public()
                ->with(['creator'])
                ->withCount('members as members_count_calc')
                ->limit(10)
                ->get();

            return response()->json($channels);
        } catch (Exception $e) {
            Log::error('Error searching channels', [
                'query' => $request->query('q'),
                'error' => $e->getMessage()
            ]);

            return response()->json([], 500);
        }
    }

    /**
     * Get user's favorite channels
     */
    public function favorites()
    {
        try {
            if (!Auth::check()) {
                return response()->json(['channels' => []]);
            }

            $favoriteChannels = Channel::whereHas('members', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->withCount('members as members_count')
            ->orderBy('members_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($channel) {
                return [
                    'id' => $channel->id,
                    'name' => $channel->name,
                    'slug' => $channel->slug,
                    'type' => $channel->type,
                    'members_count' => $channel->members_count,
                    'is_online' => true,
                ];
            });

            return response()->json(['channels' => $favoriteChannels]);
        } catch (Exception $e) {
            Log::error('Error loading favorite channels', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return response()->json(['channels' => []], 500);
        }
    }
}
