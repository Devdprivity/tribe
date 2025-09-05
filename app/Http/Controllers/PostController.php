<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Post;
use App\Models\PostLike;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Exception;

class PostController extends Controller
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
            // Optimized eager loading: only load necessary fields
            $posts = Post::with([
                'user:id,username,full_name,avatar', // Only needed user fields
                'comments' => function ($query) {
                    // Limit comments loaded + only needed fields
                    $query->with('user:id,username,full_name,avatar')
                          ->latest()
                          ->limit(3); // Only load first 3 comments
                }
            ])
            ->withCount([
                'comments as comments_count_calc',
                'likes as total_likes_count'
            ])
            ->select([
                'id', 'user_id', 'content', 'type', 'code_language', 
                'media_urls', 'channel_id', 'is_pinned', 'created_at', 'updated_at'
            ])
            ->when($request->type, fn($query, $type) => $query->where('type', $type))
            ->when($request->user_id, fn($query, $userId) => $query->where('user_id', $userId))
            ->latest()
            ->paginate(10);

            // Batch enrich user data if authenticated (NO MORE N+1!)
            if (Auth::check()) {
                $this->enrichPostsWithUserData($posts, Auth::user());
            }

            // Use cached/optimized sidebar data
            [$trending_hashtags, $popular_today] = $this->loadSidebarData();

            // Clear model references for Octane memory management
            $this->clearModelMemory($posts);

            return Inertia::render('posts', [
                'posts' => $posts,
                'filters' => $request->only('type', 'user_id', 'search', 'hashtag', 'time_range'),
                'trending_hashtags' => $trending_hashtags,
                'popular_today' => $popular_today,
            ]);
        } catch (Exception $e) {
            Log::error('Error loading posts index', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_params' => $request->only('type', 'user_id', 'search')
            ]);
            
            return Inertia::render('posts', [
                'posts' => collect(),
                'filters' => $request->only('type', 'user_id', 'search', 'hashtag', 'time_range'),
                'trending_hashtags' => [],
                'popular_today' => collect(),
            ])->with('error', 'Ocurrió un error al cargar los posts. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('posts/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:5000',
            'type' => 'required|in:text,image,video,code,project',
            'code_language' => 'nullable|string|max:100',
            'media_urls' => 'nullable|array',
            'media_urls.*' => 'url',
        ]);

        $post = Post::create([
            'user_id' => Auth::id(),
            'content' => $request->content,
            'type' => $request->type,
            'code_language' => $request->code_language,
            'media_urls' => $request->media_urls,
            'channel_id' => $request->channel_id,
        ]);

        // Si el post es en un canal, notificar a los miembros
        if ($request->channel_id) {
            $channel = Channel::find($request->channel_id);
            if ($channel) {
                $this->notificationService->channelNewPost(Auth::user(), $post, $channel);
            }
        }

        return redirect()->route('posts.show', $post)
            ->with('success', '¡Post creado exitosamente!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        $post->load(['user', 'comments.user', 'comments.replies.user']);

        // Verificar si el usuario actual le dio like al post
        $userLike = null;
        if (Auth::check()) {
            $userLike = PostLike::where('post_id', $post->id)
                ->where('user_id', Auth::id())
                ->first();
        }

        return Inertia::render('posts/show', [
            'post' => $post,
            'userLike' => $userLike,
            'likesCount' => [
                'like' => $post->getLikesCountByType('like'),
                'fire' => $post->getLikesCountByType('fire'),
                'idea' => $post->getLikesCountByType('idea'),
                'bug' => $post->getLikesCountByType('bug'),
                'sparkle' => $post->getLikesCountByType('sparkle'),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        Gate::authorize('update', $post);

        return Inertia::render('posts/edit', [
            'post' => $post,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        Gate::authorize('update', $post);

        $request->validate([
            'content' => 'required|string|max:5000',
            'type' => 'required|in:text,image,video,code,project',
            'code_language' => 'nullable|string|max:100',
            'media_urls' => 'nullable|array',
            'media_urls.*' => 'url',
        ]);

        $post->update([
            'content' => $request->content,
            'type' => $request->type,
            'code_language' => $request->code_language,
            'media_urls' => $request->media_urls,
        ]);

        return redirect()->route('posts.show', $post)
            ->with('success', '¡Post actualizado exitosamente!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return redirect()->route('posts.index')
            ->with('success', '¡Post eliminado exitosamente!');
    }

    /**
     * Toggle like on a post
     */
    public function toggleLike(Request $request, Post $post)
    {
        $request->validate([
            'type' => 'required|in:like,fire,idea,bug,sparkle',
        ]);

        $user = Auth::user();
        $type = $request->type;

        $existingLike = PostLike::where('post_id', $post->id)
            ->where('user_id', $user->id)
            ->where('type', $type)
            ->first();

        if ($existingLike) {
            // Remove like
            $existingLike->delete();
            $action = 'removed';
        } else {
            // Add like (remove other types first)
            PostLike::where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->delete();

            PostLike::create([
                'post_id' => $post->id,
                'user_id' => $user->id,
                'type' => $type,
            ]);

            // Crear notificación de like
            if ($post->user_id !== $user->id) {
                $this->notificationService->postLiked($user, $post);
            }

            $action = 'added';
        }

        // Obtener conteos actualizados
        $likesCount = [
            'like' => $post->getLikesCountByType('like'),
            'fire' => $post->getLikesCountByType('fire'),
            'idea' => $post->getLikesCountByType('idea'),
            'bug' => $post->getLikesCountByType('bug'),
            'sparkle' => $post->getLikesCountByType('sparkle'),
        ];

        return response()->json([
            'action' => $action,
            'type' => $type,
            'likes_count' => $likesCount,
            'user_reaction' => $action === 'added' ? $type : null
        ]);
    }

    /**
     * Pin/Unpin a post
     */
    public function togglePin(Post $post)
    {
        Gate::authorize('update', $post);

        $post->update(['is_pinned' => !$post->is_pinned]);

        $message = $post->is_pinned ? 'Post fijado' : 'Post desfijado';

        return back()->with('success', "¡{$message} exitosamente!");
    }

    /**
     * Get user's timeline
     */
    public function timeline(Request $request)
    {
        try {
            $user = Auth::user();

            // Optimized: Get following IDs with cache
            $followingIds = Cache::remember("user.{$user->id}.following", 600, function () use ($user) {
                return $user->following()->pluck('users.id')->toArray();
            });
            
            $userIds = array_merge($followingIds, [Auth::id()]);

            // Optimized query with limited fields and relations
            $posts = Post::with([
                'user:id,username,full_name,avatar',
                'comments' => function ($query) {
                    $query->with('user:id,username,full_name,avatar')
                          ->latest()
                          ->limit(3); // Limit initial comment load
                }
            ])
            ->withCount([
                'comments as comments_count_calc',
                'likes as total_likes_count'
            ])
            ->select([
                'id', 'user_id', 'content', 'type', 'code_language', 
                'media_urls', 'channel_id', 'is_pinned', 'created_at', 'updated_at'
            ])
            ->whereIn('user_id', $userIds)
            ->when($request->type, fn($query, $type) => $query->where('type', $type))
            ->latest()
            ->paginate(10);

            // Use optimized batch enrichment (eliminates N+1)
            $this->enrichPostsWithUserData($posts, $user);
            
            // Clear memory references for Octane
            $this->clearModelMemory($posts);

            return Inertia::render('timeline', [
                'posts' => $posts,
                'filters' => [
                    'type' => $request->get('type', ''),
                    'search' => $request->get('search', ''),
                ],
            ]);
        } catch (Exception $e) {
            Log::error('Error loading timeline', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('timeline', [
                'posts' => collect(),
                'filters' => [
                    'type' => $request->get('type', ''),
                    'search' => $request->get('search', ''),
                ],
            ])->with('error', 'Error al cargar el timeline. Por favor, recarga la página.');
        }
    }

    /**
     * Get posts by hashtag
     */
    public function byHashtag(Request $request, string $hashtag)
    {
        try {
            $posts = Post::with(['user', 'comments.user'])
                ->withCount('comments as comments_count_calc')
                ->where('content', 'like', '%#' . $hashtag . '%')
                ->latest()
                ->paginate(10);

            if (Auth::check()) {
                $this->enrichPostsWithUserData($posts, Auth::user());
            }

            return Inertia::render('posts/hashtag', [
                'posts' => $posts,
                'hashtag' => $hashtag,
            ]);
        } catch (Exception $e) {
            Log::error('Error loading hashtag posts', [
                'hashtag' => $hashtag,
                'error' => $e->getMessage()
            ]);

            return Inertia::render('posts/hashtag', [
                'posts' => collect(),
                'hashtag' => $hashtag,
            ])->with('error', 'Error al cargar los posts del hashtag.');
        }
    }

    private function enrichPostsWithUserData($posts, $user)
    {
        if ($posts->isEmpty()) {
            return;
        }

        $postIds = $posts->pluck('id');
        
        // BATCH 1: Single query for all bookmarks
        $bookmarks = $user->bookmarkedPosts()
            ->whereIn('post_id', $postIds)
            ->pluck('post_id')
            ->flip(); // For O(1) lookup
        
        // BATCH 2: Single query for all user reactions
        $userReactions = PostLike::whereIn('post_id', $postIds)
            ->where('user_id', $user->id)
            ->pluck('type', 'post_id');
        
        // BATCH 3: Single query for all like counts by type
        $likeCounts = PostLike::whereIn('post_id', $postIds)
            ->selectRaw('post_id, type, COUNT(*) as count')
            ->groupBy('post_id', 'type')
            ->get()
            ->groupBy('post_id')
            ->map(function ($likes) {
                return $likes->pluck('count', 'type');
            });
        
        // Transform with batch data (no more queries!)
        $posts->getCollection()->transform(function ($post) use ($bookmarks, $userReactions, $likeCounts) {
            $post->is_bookmarked = isset($bookmarks[$post->id]);
            $post->user_reaction = $userReactions[$post->id] ?? null;
            
            $postLikes = $likeCounts[$post->id] ?? collect();
            $post->fire_count = $postLikes['fire'] ?? 0;
            $post->idea_count = $postLikes['idea'] ?? 0;
            $post->bug_count = $postLikes['bug'] ?? 0;
            $post->sparkle_count = $postLikes['sparkle'] ?? 0;
            $post->like_count = $postLikes['like'] ?? 0;
            
            return $post;
        });
        
        // Clear references for memory management
        unset($bookmarks, $userReactions, $likeCounts);
    }

    private function getTrendingHashtags(): array
    {
        // TODO: Make this dynamic based on actual post content analysis
        return ['laravel', 'php', 'javascript', 'react', 'vue', 'nodejs', 'python', 'docker'];
    }

    private function getPopularTodayPosts()
    {
        // Optimized: only select needed fields + use cache
        return Cache::remember('posts.popular.today', 300, function () {
            return Post::with('user:id,username,full_name,avatar')
                ->select('id', 'user_id', 'content', 'type', 'likes_count', 'created_at')
                ->whereDate('created_at', today())
                ->orderBy('likes_count', 'desc')
                ->take(5)
                ->get();
        });
    }

    private function notifyChannelMembers(Post $post, int $channelId): void
    {
        try {
            $channel = Channel::find($channelId);
            if ($channel) {
                $this->notificationService->channelNewPost(Auth::user(), $post, $channel);
            }
        } catch (Exception $e) {
            Log::warning('Failed to notify channel members', [
                'post_id' => $post->id,
                'channel_id' => $channelId,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Load sidebar data in parallel for better performance
     */
    private function loadSidebarData(): array
    {
        // Use array destructuring for cleaner parallel loading
        return [
            $this->getTrendingHashtags(),
            $this->getPopularTodayPosts()
        ];
    }
    
    /**
     * Clear model references for memory management in Octane
     */
    private function clearModelMemory($models): void
    {
        if (!$models instanceof \Illuminate\Contracts\Pagination\LengthAwarePaginator) {
            return;
        }
        
        // Clear internal Eloquent caches and relations
        $models->getCollection()->each(function ($model) {
            if ($model instanceof \Illuminate\Database\Eloquent\Model) {
                // Clear model relations to free memory
                $model->unsetRelations();
                
                // Clear attributes cache if method exists
                if (method_exists($model, 'flushEventListeners')) {
                    $model->flushEventListeners();
                }
            }
        });
        
        // Suggest garbage collection in development
        if (app()->environment(['local', 'testing']) && function_exists('gc_collect_cycles')) {
            gc_collect_cycles();
        }
    }
    
    /**
     * Batch load post reactions for multiple posts (Octane-optimized)
     */
    private function batchLoadReactions(array $postIds, int $userId): array
    {
        // Single query to get all reactions for all posts
        return PostLike::whereIn('post_id', $postIds)
            ->selectRaw('post_id, type, COUNT(*) as count, MAX(CASE WHEN user_id = ? THEN type END) as user_reaction', [$userId])
            ->groupBy('post_id', 'type')
            ->get()
            ->groupBy('post_id')
            ->toArray();
    }
    
    /**
     * Performance monitoring for Octane
     */
    private function logPerformanceMetrics(string $method, float $startTime, int $queryCount = null): void
    {
        $executionTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds
        $memoryUsage = memory_get_peak_usage(true) / 1024 / 1024; // Convert to MB
        
        Log::debug("PostController::{$method} Performance", [
            'execution_time_ms' => round($executionTime, 2),
            'memory_peak_mb' => round($memoryUsage, 2),
            'queries_count' => $queryCount,
            'user_id' => Auth::id(),
            'timestamp' => now()->toISOString()
        ]);
    }
}
