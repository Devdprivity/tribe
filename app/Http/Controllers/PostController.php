<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostLike;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $posts = Post::with(['user', 'comments.user'])
            ->withCount('comments as comments_count_calc')
            ->when($request->type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->when($request->user_id, function ($query, $userId) {
                return $query->where('user_id', $userId);
            })
            ->latest()
            ->paginate(10);

        // Agregar información de favoritos y reacciones si el usuario está autenticado
        if (Auth::check()) {
            $user = Auth::user();
            $posts->getCollection()->transform(function ($post) use ($user) {
                $post->is_bookmarked = $user->bookmarkedPosts()->where('post_id', $post->id)->exists();
                
                // Agregar información de reacciones
                $post->fire_count = $post->getLikesCountByType('fire');
                $post->idea_count = $post->getLikesCountByType('idea');
                $post->bug_count = $post->getLikesCountByType('bug');
                $post->sparkle_count = $post->getLikesCountByType('sparkle');
                
                // Verificar si el usuario actual dio like y qué tipo
                $userLike = PostLike::where('post_id', $post->id)
                    ->where('user_id', $user->id)
                    ->first();
                $post->user_reaction = $userLike ? $userLike->type : null;
                
                return $post;
            });
        }

        // Obtener hashtags trending
        $trending_hashtags = ['laravel', 'php', 'javascript', 'react', 'vue', 'nodejs', 'python', 'docker'];

        // Posts populares de hoy
        $popular_today = Post::with('user')
            ->whereDate('created_at', today())
            ->orderBy('likes_count', 'desc')
            ->take(5)
            ->get();

        return Inertia::render('posts', [
            'posts' => $posts,
            'filters' => $request->only('type', 'user_id', 'search', 'hashtag', 'time_range'),
            'trending_hashtags' => $trending_hashtags,
            'popular_today' => $popular_today,
        ]);
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
                NotificationService::channelNewPost(Auth::user(), $post, $channel);
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
            NotificationService::postLiked($user, $post);

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
        $user = Auth::user();

        // Posts de usuarios que sigue + posts propios
        $followingIds = $user->following()->pluck('users.id')->toArray();
        $userIds = array_merge($followingIds, [Auth::id()]);

        $posts = Post::with(['user', 'comments.user'])
            ->withCount('comments as comments_count_calc')
            ->whereIn('user_id', $userIds)
            ->when($request->type, function ($query, $type) {
                return $query->where('type', $type);
            })
            ->latest()
            ->paginate(10);

        // Agregar información de favoritos y reacciones
        $posts->getCollection()->transform(function ($post) use ($user) {
            $post->is_bookmarked = $user->bookmarkedPosts()->where('post_id', $post->id)->exists();
            
            // Agregar información de reacciones
            $post->fire_count = $post->getLikesCountByType('fire');
            $post->idea_count = $post->getLikesCountByType('idea');
            $post->bug_count = $post->getLikesCountByType('bug');
            $post->sparkle_count = $post->getLikesCountByType('sparkle');
            
            // Verificar si el usuario actual dio like y qué tipo
            $userLike = PostLike::where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->first();
            $post->user_reaction = $userLike ? $userLike->type : null;
            
            return $post;
        });

        return Inertia::render('timeline', [
            'posts' => $posts,
            'filters' => $request->only('type'),
        ]);
    }

    /**
     * Get posts by hashtag
     */
    public function byHashtag(Request $request, string $hashtag)
    {
        $posts = Post::with(['user', 'comments.user'])
            ->withCount('comments as comments_count_calc')
            ->where('content', 'like', '%#' . $hashtag . '%')
            ->latest()
            ->paginate(10);

        return Inertia::render('posts/hashtag', [
            'posts' => $posts,
            'hashtag' => $hashtag,
        ]);
    }
}
