<?php

namespace App\Http\Controllers;

use App\Models\AIConversation;
use App\Models\AICodeSession;
use App\Models\User;
use App\Services\AIAssistantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AIAssistantController extends Controller
{
    protected AIAssistantService $aiService;

    public function __construct(AIAssistantService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index()
    {
        $user = Auth::user();

        // Recent conversations
        $recentConversations = AIConversation::where('user_id', $user->id)
            ->orderByDesc('updated_at')
            ->take(10)
            ->get();

        // Usage stats
        $stats = [
            'conversations_count' => AIConversation::where('user_id', $user->id)->count(),
            'code_sessions_count' => AICodeSession::where('user_id', $user->id)->count(),
            'total_messages' => AIConversation::where('user_id', $user->id)
                ->sum('messages_count'),
            'avg_session_duration' => AICodeSession::where('user_id', $user->id)
                ->avg('duration_minutes'),
        ];

        // Popular coding topics
        $popularTopics = $this->getPopularCodingTopics();

        return Inertia::render('AI/Index', [
            'recentConversations' => $recentConversations,
            'stats' => $stats,
            'popularTopics' => $popularTopics,
        ]);
    }

    public function chat()
    {
        return Inertia::render('AI/Chat', [
            'capabilities' => $this->aiService->getCapabilities(),
            'codeTemplates' => $this->aiService->getCodeTemplates(),
        ]);
    }

    public function startConversation(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'type' => 'required|in:general,code_review,debugging,learning,optimization',
            'context' => 'nullable|array',
        ]);

        $conversation = AIConversation::create([
            'user_id' => Auth::id(),
            'title' => $request->title ?: 'Nueva conversación',
            'type' => $request->type,
            'context' => $request->context,
            'status' => 'active',
            'messages_count' => 0,
        ]);

        return response()->json([
            'conversation' => $conversation,
            'message' => 'Conversación iniciada exitosamente.',
        ]);
    }

    public function sendMessage(Request $request, AIConversation $conversation)
    {
        $this->authorize('update', $conversation);

        $request->validate([
            'message' => 'required|string|max:4000',
            'code' => 'nullable|string|max:20000',
            'language' => 'nullable|string',
            'file_path' => 'nullable|string',
        ]);

        // Add user message to conversation
        $userMessage = $conversation->messages()->create([
            'role' => 'user',
            'content' => $request->message,
            'code' => $request->code,
            'language' => $request->language,
            'file_path' => $request->file_path,
            'metadata' => [
                'timestamp' => now()->toISOString(),
                'user_agent' => $request->header('User-Agent'),
            ],
        ]);

        // Get AI response
        try {
            $aiResponse = $this->aiService->processMessage(
                $conversation,
                $request->message,
                $request->code,
                $request->language,
                $request->file_path
            );

            // Add AI response to conversation
            $aiMessage = $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $aiResponse['content'],
                'code' => $aiResponse['code'] ?? null,
                'language' => $aiResponse['language'] ?? null,
                'suggestions' => $aiResponse['suggestions'] ?? null,
                'metadata' => [
                    'processing_time_ms' => $aiResponse['processing_time'] ?? 0,
                    'model_used' => $aiResponse['model'] ?? 'default',
                    'confidence_score' => $aiResponse['confidence'] ?? null,
                ],
            ]);

            // Update conversation stats
            $conversation->increment('messages_count', 2);
            $conversation->touch();

            return response()->json([
                'user_message' => $userMessage,
                'ai_message' => $aiMessage,
                'suggestions' => $aiResponse['suggestions'] ?? [],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error procesando mensaje: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function codeReview(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:20000',
            'language' => 'required|string',
            'context' => 'nullable|string|max:1000',
            'focus_areas' => 'nullable|array',
        ]);

        try {
            $review = $this->aiService->reviewCode(
                $request->code,
                $request->language,
                $request->context,
                $request->focus_areas ?? []
            );

            // Save code session
            $session = AICodeSession::create([
                'user_id' => Auth::id(),
                'type' => 'code_review',
                'language' => $request->language,
                'original_code' => $request->code,
                'context' => $request->context,
                'ai_analysis' => $review,
                'status' => 'completed',
                'duration_minutes' => 0,
            ]);

            return response()->json([
                'session' => $session,
                'review' => $review,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en code review: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function debugCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:20000',
            'language' => 'required|string',
            'error_message' => 'nullable|string',
            'expected_behavior' => 'nullable|string|max:1000',
            'context' => 'nullable|string|max:1000',
        ]);

        try {
            $debugging = $this->aiService->debugCode(
                $request->code,
                $request->language,
                $request->error_message,
                $request->expected_behavior,
                $request->context
            );

            // Save debugging session
            $session = AICodeSession::create([
                'user_id' => Auth::id(),
                'type' => 'debugging',
                'language' => $request->language,
                'original_code' => $request->code,
                'error_message' => $request->error_message,
                'context' => $request->context,
                'ai_analysis' => $debugging,
                'status' => 'completed',
            ]);

            return response()->json([
                'session' => $session,
                'debugging' => $debugging,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en debugging: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function optimizeCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:20000',
            'language' => 'required|string',
            'optimization_goals' => 'required|array',
            'context' => 'nullable|string|max:1000',
        ]);

        try {
            $optimization = $this->aiService->optimizeCode(
                $request->code,
                $request->language,
                $request->optimization_goals,
                $request->context
            );

            // Save optimization session
            $session = AICodeSession::create([
                'user_id' => Auth::id(),
                'type' => 'optimization',
                'language' => $request->language,
                'original_code' => $request->code,
                'optimized_code' => $optimization['optimized_code'] ?? null,
                'context' => $request->context,
                'ai_analysis' => $optimization,
                'status' => 'completed',
            ]);

            return response()->json([
                'session' => $session,
                'optimization' => $optimization,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en optimización: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function generateCode(Request $request)
    {
        $request->validate([
            'description' => 'required|string|max:2000',
            'language' => 'required|string',
            'framework' => 'nullable|string',
            'requirements' => 'nullable|array',
            'style_preferences' => 'nullable|array',
        ]);

        try {
            $generation = $this->aiService->generateCode(
                $request->description,
                $request->language,
                $request->framework,
                $request->requirements ?? [],
                $request->style_preferences ?? []
            );

            // Save generation session
            $session = AICodeSession::create([
                'user_id' => Auth::id(),
                'type' => 'code_generation',
                'language' => $request->language,
                'description' => $request->description,
                'generated_code' => $generation['code'] ?? null,
                'context' => json_encode([
                    'framework' => $request->framework,
                    'requirements' => $request->requirements,
                    'style_preferences' => $request->style_preferences,
                ]),
                'ai_analysis' => $generation,
                'status' => 'completed',
            ]);

            return response()->json([
                'session' => $session,
                'generation' => $generation,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error generando código: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function explainCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:20000',
            'language' => 'required|string',
            'complexity_level' => 'nullable|in:beginner,intermediate,advanced',
        ]);

        try {
            $explanation = $this->aiService->explainCode(
                $request->code,
                $request->language,
                $request->complexity_level ?? 'intermediate'
            );

            // Save explanation session
            $session = AICodeSession::create([
                'user_id' => Auth::id(),
                'type' => 'code_explanation',
                'language' => $request->language,
                'original_code' => $request->code,
                'context' => $request->complexity_level,
                'ai_analysis' => $explanation,
                'status' => 'completed',
            ]);

            return response()->json([
                'session' => $session,
                'explanation' => $explanation,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error explicando código: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getConversation(AIConversation $conversation)
    {
        $this->authorize('view', $conversation);

        $conversation->load(['messages' => function ($query) {
            $query->orderBy('created_at');
        }]);

        return response()->json(['conversation' => $conversation]);
    }

    public function deleteConversation(AIConversation $conversation)
    {
        $this->authorize('delete', $conversation);

        $conversation->delete();

        return response()->json(['message' => 'Conversación eliminada exitosamente.']);
    }

    public function getCodeSession(AICodeSession $session)
    {
        $this->authorize('view', $session);

        return response()->json(['session' => $session]);
    }

    public function myConversations(Request $request)
    {
        $conversations = AIConversation::where('user_id', Auth::id())
            ->when($request->type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->when($request->search, function ($query, $search) {
                return $query->where('title', 'like', "%{$search}%");
            })
            ->orderByDesc('updated_at')
            ->paginate(20);

        return Inertia::render('AI/MyConversations', [
            'conversations' => $conversations,
            'filters' => $request->only(['type', 'search']),
            'conversationTypes' => $this->getConversationTypes(),
        ]);
    }

    public function myCodeSessions(Request $request)
    {
        $sessions = AICodeSession::where('user_id', Auth::id())
            ->when($request->type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->when($request->language, function ($query, $language) {
                return $query->where('language', $language);
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        $stats = [
            'total_sessions' => AICodeSession::where('user_id', Auth::id())->count(),
            'languages_used' => AICodeSession::where('user_id', Auth::id())
                ->distinct('language')
                ->count(),
            'favorite_language' => AICodeSession::where('user_id', Auth::id())
                ->selectRaw('language, COUNT(*) as count')
                ->groupBy('language')
                ->orderByDesc('count')
                ->first()
                ?->language,
        ];

        return Inertia::render('AI/MyCodeSessions', [
            'sessions' => $sessions,
            'stats' => $stats,
            'filters' => $request->only(['type', 'language']),
            'sessionTypes' => $this->getSessionTypes(),
            'supportedLanguages' => $this->aiService->getSupportedLanguages(),
        ]);
    }

    public function analytics()
    {
        $user = Auth::user();

        // Usage analytics
        $analytics = [
            'daily_usage' => $this->getDailyUsageStats($user),
            'language_distribution' => $this->getLanguageDistribution($user),
            'session_types' => $this->getSessionTypeStats($user),
            'productivity_metrics' => $this->getProductivityMetrics($user),
            'learning_progress' => $this->getLearningProgress($user),
        ];

        return Inertia::render('AI/Analytics', [
            'analytics' => $analytics,
        ]);
    }

    private function getDailyUsageStats(User $user): array
    {
        return AIConversation::where('user_id', $user->id)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as conversations')
            ->where('created_at', '>', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    private function getLanguageDistribution(User $user): array
    {
        return AICodeSession::where('user_id', $user->id)
            ->selectRaw('language, COUNT(*) as count')
            ->groupBy('language')
            ->orderByDesc('count')
            ->get()
            ->toArray();
    }

    private function getSessionTypeStats(User $user): array
    {
        return AICodeSession::where('user_id', $user->id)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->orderByDesc('count')
            ->get()
            ->toArray();
    }

    private function getProductivityMetrics(User $user): array
    {
        $sessions = AICodeSession::where('user_id', $user->id)->get();

        return [
            'avg_session_duration' => $sessions->avg('duration_minutes'),
            'total_code_generated' => $sessions->where('type', 'code_generation')->count(),
            'bugs_debugged' => $sessions->where('type', 'debugging')->count(),
            'code_reviews' => $sessions->where('type', 'code_review')->count(),
            'optimizations' => $sessions->where('type', 'optimization')->count(),
        ];
    }

    private function getLearningProgress(User $user): array
    {
        $explanations = AICodeSession::where('user_id', $user->id)
            ->where('type', 'code_explanation')
            ->get();

        return [
            'concepts_learned' => $explanations->count(),
            'languages_explored' => $explanations->unique('language')->count(),
            'learning_streak' => $this->calculateLearningStreak($user),
        ];
    }

    private function calculateLearningStreak(User $user): int
    {
        $days = 0;
        $currentDate = now()->startOfDay();

        while ($days < 365) {
            $hasActivity = AIConversation::where('user_id', $user->id)
                ->whereDate('created_at', $currentDate)
                ->exists();

            if (!$hasActivity) {
                break;
            }

            $days++;
            $currentDate->subDay();
        }

        return $days;
    }

    private function getPopularCodingTopics(): array
    {
        return [
            'React Hooks',
            'Python Data Structures',
            'JavaScript Async/Await',
            'SQL Optimization',
            'API Design',
            'Docker Containers',
            'Git Workflows',
            'Testing Strategies',
            'Performance Optimization',
            'Security Best Practices',
        ];
    }

    private function getConversationTypes(): array
    {
        return [
            'general' => 'General',
            'code_review' => 'Code Review',
            'debugging' => 'Debugging',
            'learning' => 'Aprendizaje',
            'optimization' => 'Optimización',
        ];
    }

    private function getSessionTypes(): array
    {
        return [
            'code_review' => 'Code Review',
            'debugging' => 'Debugging',
            'optimization' => 'Optimización',
            'code_generation' => 'Generación de Código',
            'code_explanation' => 'Explicación de Código',
        ];
    }
}