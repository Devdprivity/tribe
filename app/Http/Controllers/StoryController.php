<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StoryController extends Controller
{
    /**
     * Obtener historias para el timeline
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Obtener historias de usuarios seguidos + propias
        $followingIds = $user->following()->pluck('users.id')->toArray();
        $userIds = array_merge($followingIds, [Auth::id()]);

        $stories = Story::with(['user', 'likes'])
            ->whereIn('user_id', $userIds)
            ->active()
            ->latest()
            ->get()
            ->groupBy('user_id')
            ->map(function ($userStories) use ($user) {
                $firstUser = $userStories->first()->user;
                return [
                    'user' => [
                        'id' => $firstUser->id,
                        'username' => $firstUser->username,
                        'full_name' => $firstUser->full_name,
                        'avatar' => $firstUser->avatar_url,
                    ],
                    'stories' => $userStories->map(function ($story) use ($user) {
                        return [
                            'id' => $story->id,
                            'media_url' => $story->media_url,
                            'media_type' => $story->media_type,
                            'caption' => $story->caption,
                            'expires_at' => $story->expires_at,
                            'time_remaining' => $story->time_remaining,
                            'created_at' => $story->created_at,
                            'likes_count' => $story->likes_count,
                            'is_liked' => $story->isLikedBy($user->id),
                        ];
                    }),
                    'has_viewed' => false, // TODO: Implementar sistema de vistas
                ];
            })
            ->values();

        return response()->json($stories);
    }

    /**
     * Crear una nueva historia
     */
    public function store(Request $request)
    {
        try {
            \Log::info('Story creation attempt', [
                'user_id' => Auth::id(),
                'request_data' => $request->except(['media']),
                'has_media' => $request->hasFile('media'),
                'media_size' => $request->hasFile('media') ? $request->file('media')->getSize() : 0
            ]);

            // Validar que el archivo existe y no está vacío
            if (!$request->hasFile('media')) {
                return response()->json([
                    'success' => false,
                    'error' => 'No se ha seleccionado ningún archivo.'
                ], 400);
            }

            $file = $request->file('media');
            
            // Validar que el archivo no esté vacío
            if ($file->getSize() === 0) {
                return response()->json([
                    'success' => false,
                    'error' => 'El archivo seleccionado está vacío. Por favor, selecciona un archivo válido.'
                ], 400);
            }

            // Validar el archivo
            $validator = validator($request->all(), [
                'media' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,webm|max:10240', // 10MB max
                'caption' => 'nullable|string|max:200',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Archivo no válido. Formatos permitidos: JPEG, PNG, JPG, GIF, MP4, MOV, AVI, WEBM. Tamaño máximo: 10MB.',
                    'details' => $validator->errors()->first('media')
                ], 422);
            }

            $user = Auth::user();

            // Subir el archivo
            $mediaType = $file->getMimeType();
            $isVideo = str_starts_with($mediaType, 'video/');
            
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('stories', $filename, 'public');

            if (!$path) {
                return response()->json([
                    'success' => false,
                    'error' => 'Error al guardar el archivo. Intenta de nuevo.'
                ], 500);
            }

            // Crear la historia
            $story = Story::createStory(
                $user->id,
                Storage::url($path),
                $isVideo ? 'video' : 'image',
                $request->caption
            );

            \Log::info('Story created successfully', [
                'story_id' => $story->id,
                'user_id' => Auth::id(),
                'media_type' => $isVideo ? 'video' : 'image',
                'file_size' => $file->getSize()
            ]);

            return response()->json([
                'success' => true,
                'story' => [
                    'id' => $story->id,
                    'media_url' => $story->media_url,
                    'media_type' => $story->media_type,
                    'caption' => $story->caption,
                    'expires_at' => $story->expires_at,
                    'time_remaining' => $story->time_remaining,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Story creation failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Error interno del servidor. Por favor, intenta de nuevo.'
            ], 500);
        }
    }

    /**
     * Obtener historias de un usuario específico
     */
    public function show($userId)
    {
        $user = Auth::user();
        $stories = Story::with(['user', 'likes'])
            ->where('user_id', $userId)
            ->active()
            ->latest()
            ->get();

        if ($stories->isEmpty()) {
            return response()->json(['error' => 'No hay historias disponibles'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $stories->first()->user->id,
                'username' => $stories->first()->user->username,
                'full_name' => $stories->first()->user->full_name,
                'avatar' => $stories->first()->user->avatar_url,
            ],
            'stories' => $stories->map(function ($story) use ($user) {
                return [
                    'id' => $story->id,
                    'media_url' => $story->media_url,
                    'media_type' => $story->media_type,
                    'caption' => $story->caption,
                    'expires_at' => $story->expires_at,
                    'time_remaining' => $story->time_remaining,
                    'created_at' => $story->created_at,
                    'likes_count' => $story->likes_count,
                    'is_liked' => $story->isLikedBy($user->id),
                ];
            })
        ]);
    }

    /**
     * Eliminar una historia
     */
    public function destroy(Story $story)
    {
        // Verificar que el usuario es el propietario
        if ($story->user_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Eliminar archivo del storage
        $path = str_replace('/storage/', '', $story->media_url);
        Storage::disk('public')->delete($path);

        // Eliminar de la base de datos
        $story->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Limpiar historias expiradas (comando)
     */
    public function cleanup()
    {
        $expiredStories = Story::where('expires_at', '<', now())->get();
        
        foreach ($expiredStories as $story) {
            // Eliminar archivo del storage
            $path = str_replace('/storage/', '', $story->media_url);
            Storage::disk('public')->delete($path);
            
            // Eliminar de la base de datos
            $story->delete();
        }

        return response()->json([
            'success' => true,
            'deleted_count' => $expiredStories->count()
        ]);
    }
}