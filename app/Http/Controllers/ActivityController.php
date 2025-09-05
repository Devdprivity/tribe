<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PostLike;
use App\Models\Comment;
use App\Models\StoryLike;
use App\Models\StoryComment;
use App\Models\Post;
use App\Models\Story;
use App\Models\User;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{
    /**
     * Obtener actividades recientes (likes, comentarios, follows)
     */
    public function recent(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        try {
            $activities = collect();

            // 1. Obtener likes en posts del usuario
            $postLikes = PostLike::whereHas('post', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('user_id', '!=', $user->id) // Excluir likes propios
            ->with(['user', 'post'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($like) {
                return [
                    'id' => 'post_like_' . $like->id,
                    'type' => 'like',
                    'action' => 'le dio like a tu post',
                    'content' => $like->post->content ? substr($like->post->content, 0, 100) . '...' : null,
                    'user' => [
                        'id' => $like->user->id,
                        'username' => $like->user->username,
                        'full_name' => $like->user->full_name,
                        'avatar' => $like->user->avatar,
                    ],
                    'created_at' => $like->created_at,
                ];
            });

            // 2. Obtener comentarios en posts del usuario
            $postComments = Comment::whereHas('post', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('user_id', '!=', $user->id) // Excluir comentarios propios
            ->with(['user', 'post'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => 'post_comment_' . $comment->id,
                    'type' => 'comment',
                    'action' => 'comentó en tu post',
                    'content' => $comment->content,
                    'user' => [
                        'id' => $comment->user->id,
                        'username' => $comment->user->username,
                        'full_name' => $comment->user->full_name,
                        'avatar' => $comment->user->avatar,
                    ],
                    'created_at' => $comment->created_at,
                ];
            });

            // 3. Obtener likes en historias del usuario
            $storyLikes = StoryLike::whereHas('story', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('user_id', '!=', $user->id) // Excluir likes propios
            ->with(['user', 'story'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($like) {
                return [
                    'id' => 'story_like_' . $like->id,
                    'type' => 'like',
                    'action' => 'le dio like a tu historia',
                    'content' => null,
                    'user' => [
                        'id' => $like->user->id,
                        'username' => $like->user->username,
                        'full_name' => $like->user->full_name,
                        'avatar' => $like->user->avatar,
                    ],
                    'created_at' => $like->created_at,
                ];
            });

            // 4. Obtener comentarios en historias del usuario
            $storyComments = StoryComment::whereHas('story', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->where('user_id', '!=', $user->id) // Excluir comentarios propios
            ->with(['user', 'story'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => 'story_comment_' . $comment->id,
                    'type' => 'comment',
                    'action' => 'comentó en tu historia',
                    'content' => $comment->content,
                    'user' => [
                        'id' => $comment->user->id,
                        'username' => $comment->user->username,
                        'full_name' => $comment->user->full_name,
                        'avatar' => $comment->user->avatar,
                    ],
                    'created_at' => $comment->created_at,
                ];
            });

            // Combinar todas las actividades y ordenar por fecha
            $allActivities = $activities
                ->concat($postLikes)
                ->concat($postComments)
                ->concat($storyLikes)
                ->concat($storyComments)
                ->sortByDesc('created_at')
                ->take(20)
                ->values();

            return response()->json([
                'activities' => $allActivities,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en ActivityController::recent', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Error al cargar actividades',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
