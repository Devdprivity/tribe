<?php

namespace App\Http\Controllers;

use App\Models\CodingChallenge;
use App\Models\ChallengeSubmission;
use App\Services\CodeExecutionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CodingChallengeController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only([
            'difficulty', 'category', 'language', 'status', 'search'
        ]);

        $challenges = CodingChallenge::query()
            ->with(['creator'])
            ->where('is_published', true)
            ->when($filters['difficulty'] ?? null, function ($query, $difficulty) {
                $query->where('difficulty', $difficulty);
            })
            ->when($filters['category'] ?? null, function ($query, $category) {
                $query->whereJsonContains('categories', $category);
            })
            ->when($filters['language'] ?? null, function ($query, $language) {
                $query->whereJsonContains('allowed_languages', $language);
            })
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereJsonContains('categories', $search);
                });
            })
            ->when($filters['status'] ?? null, function ($query, $status) use ($request) {
                if ($status === 'solved' && Auth::check()) {
                    $query->whereHas('submissions', function ($q) {
                        $q->where('user_id', Auth::id())
                          ->where('status', 'accepted');
                    });
                } elseif ($status === 'attempted' && Auth::check()) {
                    $query->whereHas('submissions', function ($q) {
                        $q->where('user_id', Auth::id());
                    });
                }
            })
            ->orderByDesc('created_at')
            ->paginate(20);

        // Add user's best submission for each challenge
        if (Auth::check()) {
            $challenges->getCollection()->transform(function ($challenge) {
                $challenge->user_best_submission = $challenge->submissions()
                    ->where('user_id', Auth::id())
                    ->where('is_best_submission', true)
                    ->first();
                return $challenge;
            });
        }

        $stats = [
            'total_challenges' => CodingChallenge::where('is_published', true)->count(),
            'user_solved' => Auth::check() ? 
                ChallengeSubmission::where('user_id', Auth::id())
                    ->where('status', 'accepted')
                    ->distinct('challenge_id')
                    ->count() : 0,
            'user_attempted' => Auth::check() ? 
                ChallengeSubmission::where('user_id', Auth::id())
                    ->distinct('challenge_id')
                    ->count() : 0,
        ];

        return Inertia::render('Challenges/Index', [
            'challenges' => $challenges,
            'filters' => $filters,
            'stats' => $stats,
            'difficulties' => $this->getDifficulties(),
            'categories' => $this->getPopularCategories(),
            'languages' => $this->getSupportedLanguages(),
        ]);
    }

    public function show(CodingChallenge $challenge)
    {
        $challenge->load(['creator']);

        // Get user's submissions
        $userSubmissions = [];
        $bestSubmission = null;
        if (Auth::check()) {
            $userSubmissions = $challenge->submissions()
                ->where('user_id', Auth::id())
                ->orderByDesc('created_at')
                ->take(10)
                ->get();

            $bestSubmission = $challenge->submissions()
                ->where('user_id', Auth::id())
                ->where('is_best_submission', true)
                ->first();
        }

        // Get similar challenges
        $similarChallenges = CodingChallenge::where('id', '!=', $challenge->id)
            ->where('is_published', true)
            ->where(function ($query) use ($challenge) {
                $query->where('difficulty', $challenge->difficulty)
                      ->orWhere(function ($q) use ($challenge) {
                          foreach ($challenge->categories as $category) {
                              $q->orWhereJsonContains('categories', $category);
                          }
                      });
            })
            ->take(6)
            ->get();

        return Inertia::render('Challenges/Show', [
            'challenge' => $challenge,
            'userSubmissions' => $userSubmissions,
            'bestSubmission' => $bestSubmission,
            'similarChallenges' => $similarChallenges,
            'supportedLanguages' => $this->getSupportedLanguages(),
        ]);
    }

    public function submit(Request $request, CodingChallenge $challenge)
    {
        $request->validate([
            'programming_language' => 'required|string',
            'code' => 'required|string|max:10000',
        ]);

        // Check if language is allowed
        if (!in_array($request->programming_language, $challenge->allowed_languages)) {
            return back()->withErrors(['language' => 'Lenguaje no permitido para este desafío.']);
        }

        // Create submission
        $submission = $challenge->submissions()->create([
            'user_id' => Auth::id(),
            'programming_language' => $request->programming_language,
            'code' => $request->code,
            'status' => 'pending',
        ]);

        // Execute code asynchronously
        $executionService = new CodeExecutionService();
        $result = $executionService->executeSubmission($submission, $challenge);

        // Update submission with results
        $submission->update([
            'status' => $result['status'],
            'test_results' => $result['test_results'],
            'execution_time_ms' => $result['execution_time_ms'] ?? null,
            'memory_used_mb' => $result['memory_used_mb'] ?? null,
            'error_message' => $result['error_message'] ?? null,
            'score' => $result['score'] ?? 0,
        ]);

        // Update challenge stats
        $challenge->increment('submissions_count');
        if ($result['status'] === 'accepted') {
            $challenge->increment('successful_submissions');
            
            // Mark as best submission if it's the user's first accepted solution
            $existingAccepted = $challenge->submissions()
                ->where('user_id', Auth::id())
                ->where('status', 'accepted')
                ->where('id', '!=', $submission->id)
                ->exists();

            if (!$existingAccepted) {
                $submission->update(['is_best_submission' => true]);
            }
        }

        // Update challenge success rate
        $this->updateChallengeSuccessRate($challenge);

        return back()->with('submission_result', $result);
    }

    public function leaderboard(CodingChallenge $challenge)
    {
        $submissions = $challenge->submissions()
            ->where('status', 'accepted')
            ->with('user')
            ->orderBy('execution_time_ms')
            ->orderByDesc('score')
            ->orderBy('created_at')
            ->paginate(50);

        return Inertia::render('Challenges/Leaderboard', [
            'challenge' => $challenge,
            'submissions' => $submissions,
        ]);
    }

    public function create()
    {
        return Inertia::render('Challenges/Create', [
            'difficulties' => $this->getDifficulties(),
            'categories' => $this->getAllCategories(),
            'languages' => $this->getSupportedLanguages(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'problem_statement' => 'required|string',
            'test_cases' => 'required|array|min:1',
            'test_cases.*.input' => 'required|string',
            'test_cases.*.expected_output' => 'required|string',
            'example_inputs' => 'nullable|array',
            'example_outputs' => 'nullable|array',
            'constraints' => 'nullable|array',
            'difficulty' => 'required|in:easy,medium,hard,expert',
            'categories' => 'required|array|min:1',
            'allowed_languages' => 'required|array|min:1',
            'time_limit_seconds' => 'required|integer|min:1|max:300',
            'memory_limit_mb' => 'required|integer|min:64|max:1024',
            'hints' => 'nullable|string',
            'starter_code' => 'nullable|array',
            'points_reward' => 'required|integer|min:10|max:1000',
        ]);

        $challenge = CodingChallenge::create([
            'creator_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'problem_statement' => $request->problem_statement,
            'test_cases' => $request->test_cases,
            'example_inputs' => $request->example_inputs,
            'example_outputs' => $request->example_outputs,
            'constraints' => $request->constraints,
            'difficulty' => $request->difficulty,
            'categories' => $request->categories,
            'allowed_languages' => $request->allowed_languages,
            'time_limit_seconds' => $request->time_limit_seconds,
            'memory_limit_mb' => $request->memory_limit_mb,
            'hints' => $request->hints,
            'starter_code' => $request->starter_code,
            'points_reward' => $request->points_reward,
            'is_published' => false, // Requires review
        ]);

        return redirect()->route('challenges.show', $challenge)
            ->with('success', 'Desafío creado exitosamente. Está pendiente de revisión.');
    }

    public function mySubmissions()
    {
        $submissions = ChallengeSubmission::where('user_id', Auth::id())
            ->with(['challenge'])
            ->orderByDesc('created_at')
            ->paginate(20);

        $stats = [
            'total_submissions' => $submissions->total(),
            'accepted' => ChallengeSubmission::where('user_id', Auth::id())
                ->where('status', 'accepted')
                ->count(),
            'challenges_solved' => ChallengeSubmission::where('user_id', Auth::id())
                ->where('status', 'accepted')
                ->distinct('challenge_id')
                ->count(),
            'total_score' => ChallengeSubmission::where('user_id', Auth::id())
                ->where('status', 'accepted')
                ->sum('score'),
        ];

        return Inertia::render('Challenges/MySubmissions', [
            'submissions' => $submissions,
            'stats' => $stats,
        ]);
    }

    public function globalLeaderboard()
    {
        $leaderboard = DB::table('challenge_submissions')
            ->select([
                'user_id',
                DB::raw('SUM(score) as total_score'),
                DB::raw('COUNT(DISTINCT challenge_id) as challenges_solved'),
                DB::raw('COUNT(*) as total_submissions'),
                DB::raw('AVG(execution_time_ms) as avg_execution_time')
            ])
            ->where('status', 'accepted')
            ->groupBy('user_id')
            ->orderByDesc('total_score')
            ->orderByDesc('challenges_solved')
            ->limit(100)
            ->get();

        // Load user data
        $userIds = $leaderboard->pluck('user_id');
        $users = \App\Models\User::whereIn('id', $userIds)
            ->get()
            ->keyBy('id');

        $leaderboard = $leaderboard->map(function ($entry, $index) use ($users) {
            $entry->rank = $index + 1;
            $entry->user = $users[$entry->user_id] ?? null;
            return $entry;
        });

        return Inertia::render('Challenges/GlobalLeaderboard', [
            'leaderboard' => $leaderboard,
        ]);
    }

    private function updateChallengeSuccessRate(CodingChallenge $challenge): void
    {
        $totalSubmissions = $challenge->submissions_count;
        if ($totalSubmissions > 0) {
            $successRate = ($challenge->successful_submissions / $totalSubmissions) * 100;
            $challenge->update(['success_rate' => round($successRate, 2)]);
        }
    }

    private function getDifficulties(): array
    {
        return [
            'easy' => 'Fácil',
            'medium' => 'Medio',
            'hard' => 'Difícil',
            'expert' => 'Experto',
        ];
    }

    private function getPopularCategories(): array
    {
        return DB::table('coding_challenges')
            ->selectRaw('JSON_UNQUOTE(JSON_EXTRACT(categories, "$[*]")) as category')
            ->where('is_published', true)
            ->groupBy('category')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(20)
            ->pluck('category')
            ->toArray();
    }

    private function getAllCategories(): array
    {
        return [
            'algorithms' => 'Algoritmos',
            'data-structures' => 'Estructuras de Datos',
            'dynamic-programming' => 'Programación Dinámica',
            'graph-theory' => 'Teoría de Grafos',
            'string-manipulation' => 'Manipulación de Strings',
            'array-problems' => 'Problemas de Arrays',
            'tree-traversal' => 'Recorrido de Árboles',
            'sorting-searching' => 'Ordenamiento y Búsqueda',
            'mathematical' => 'Matemáticos',
            'greedy' => 'Algoritmos Greedy',
            'backtracking' => 'Backtracking',
            'bit-manipulation' => 'Manipulación de Bits',
            'database' => 'Base de Datos',
            'system-design' => 'Diseño de Sistemas',
            'web-development' => 'Desarrollo Web',
        ];
    }

    private function getSupportedLanguages(): array
    {
        return [
            'python' => 'Python',
            'javascript' => 'JavaScript',
            'java' => 'Java',
            'cpp' => 'C++',
            'c' => 'C',
            'csharp' => 'C#',
            'php' => 'PHP',
            'ruby' => 'Ruby',
            'go' => 'Go',
            'rust' => 'Rust',
            'swift' => 'Swift',
            'kotlin' => 'Kotlin',
            'typescript' => 'TypeScript',
            'sql' => 'SQL',
        ];
    }
}