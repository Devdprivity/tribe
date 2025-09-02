<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Story;
use Illuminate\Support\Facades\Auth;

class StoryLikeController extends Controller
{
    /**
     * Dar o quitar like a una historia
     */
    public function toggleLike(Request $request, Story $story)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        try {
            $wasLiked = $story->isLikedBy($user->id);
            $story->toggleLike($user->id);
            
            return response()->json([
                'success' => true,
                'liked' => !$wasLiked,
                'likes_count' => $story->likes_count,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al procesar el like'], 500);
        }
    }

    /**
     * Obtener el estado de like de una historia para el usuario actual
     */
    public function getLikeStatus(Request $request, Story $story)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        return response()->json([
            'liked' => $story->isLikedBy($user->id),
            'likes_count' => $story->likes_count,
        ]);
    }
}
