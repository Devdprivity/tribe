<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Story;
use App\Models\StoryComment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class StoryCommentController extends Controller
{
    /**
     * Obtener comentarios de una historia
     */
    public function index(Request $request, Story $story)
    {
        $comments = $story->comments()
            ->with('user')
            ->latest()
            ->limit(50) // Limitar a 50 comentarios más recientes
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                    'user' => [
                        'id' => $comment->user->id,
                        'username' => $comment->user->username,
                        'full_name' => $comment->user->full_name,
                        'avatar' => $comment->user->avatar_url,
                    ],
                ];
            });

        return response()->json([
            'comments' => $comments,
            'total_count' => $story->comments_count,
        ]);
    }

    /**
     * Crear un nuevo comentario en una historia
     */
    public function store(Request $request, Story $story)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Contenido no válido',
                'details' => $validator->errors()->first('content')
            ], 422);
        }

        try {
            $comment = $story->addComment($user->id, $request->content);
            $comment->load('user');

            return response()->json([
                'success' => true,
                'comment' => [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                    'user' => [
                        'id' => $comment->user->id,
                        'username' => $comment->user->username,
                        'full_name' => $comment->user->full_name,
                        'avatar' => $comment->user->avatar_url,
                    ],
                ],
                'comments_count' => $story->comments_count,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al crear el comentario'], 500);
        }
    }

    /**
     * Eliminar un comentario
     */
    public function destroy(StoryComment $comment)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // Verificar que el usuario es el propietario del comentario o de la historia
        if ($comment->user_id !== $user->id && $comment->story->user_id !== $user->id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        try {
            $story = $comment->story;
            $comment->delete();

            return response()->json([
                'success' => true,
                'comments_count' => $story->comments_count,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar el comentario'], 500);
        }
    }
}
