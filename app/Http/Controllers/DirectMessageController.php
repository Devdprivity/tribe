<?php

namespace App\Http\Controllers;

use App\Models\DirectMessage;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DirectMessageController extends Controller
{
    /**
     * Mostrar conversaciones del usuario
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Obtener conversaciones (usuarios con los que ha intercambiado mensajes)
        $conversations = User::whereHas('sentMessages', function ($query) use ($user) {
            $query->where('to_user_id', $user->id);
        })->orWhereHas('receivedMessages', function ($query) use ($user) {
            $query->where('from_user_id', $user->id);
        })->with(['sentMessages' => function ($query) use ($user) {
            $query->where('to_user_id', $user->id)->latest();
        }, 'receivedMessages' => function ($query) use ($user) {
            $query->where('from_user_id', $user->id)->latest();
        }])->get();

        return Inertia::render('messages/index', [
            'conversations' => $conversations
        ]);
    }

    /**
     * Mostrar conversación con un usuario específico
     */
    public function show(User $user): Response
    {
        $currentUser = Auth::user();

        // Obtener mensajes entre los dos usuarios
        $messages = DirectMessage::where(function ($query) use ($currentUser, $user) {
            $query->where('from_user_id', $currentUser->id)
                  ->where('to_user_id', $user->id);
        })->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('from_user_id', $user->id)
                  ->where('to_user_id', $currentUser->id);
        })->with(['fromUser', 'toUser'])
          ->orderBy('created_at', 'asc')
          ->get();

        // Marcar mensajes como leídos
        DirectMessage::where('from_user_id', $user->id)
            ->where('to_user_id', $currentUser->id)
            ->where('read', false)
            ->update(['read' => true, 'read_at' => now()]);

        return Inertia::render('messages/show', [
            'otherUser' => $user,
            'messages' => $messages
        ]);
    }

    /**
     * Enviar mensaje directo
     */
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000',
        ]);

        $fromUser = Auth::user();
        $toUser = User::find($request->to_user_id);

        // No enviar mensaje a sí mismo
        if ($fromUser->id === $toUser->id) {
            return response()->json(['error' => 'No puedes enviarte mensajes a ti mismo'], 400);
        }

        $directMessage = DirectMessage::create([
            'from_user_id' => $fromUser->id,
            'to_user_id' => $toUser->id,
            'message' => $request->message,
        ]);

        // Crear notificación
        NotificationService::directMessage($fromUser, $toUser, $request->message);

        $directMessage->load(['fromUser', 'toUser']);

        return response()->json([
            'success' => true,
            'message' => $directMessage
        ]);
    }

    /**
     * Marcar mensaje como leído
     */
    public function markAsRead(DirectMessage $message): \Illuminate\Http\JsonResponse
    {
        if ($message->to_user_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $message->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Obtener mensajes no leídos
     */
    public function unread(): \Illuminate\Http\JsonResponse
    {
        $unreadCount = Auth::user()
            ->receivedMessages()
            ->unread()
            ->count();

        return response()->json([
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Obtener conversaciones para el panel de chat
     */
    public function conversations(): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        // Obtener usuarios con los que ha intercambiado mensajes
        $conversations = User::whereHas('sentMessages', function ($query) use ($user) {
            $query->where('to_user_id', $user->id);
        })->orWhereHas('receivedMessages', function ($query) use ($user) {
            $query->where('from_user_id', $user->id);
        })->with(['sentMessages' => function ($query) use ($user) {
            $query->where('to_user_id', $user->id)->latest()->limit(1);
        }, 'receivedMessages' => function ($query) use ($user) {
            $query->where('from_user_id', $user->id)->latest()->limit(1);
        }])->get();

        $conversationsData = $conversations->map(function ($otherUser) use ($user) {
            // Obtener el último mensaje entre los dos usuarios
            $lastMessage = DirectMessage::where(function ($query) use ($user, $otherUser) {
                $query->where('from_user_id', $user->id)
                      ->where('to_user_id', $otherUser->id);
            })->orWhere(function ($query) use ($user, $otherUser) {
                $query->where('from_user_id', $otherUser->id)
                      ->where('to_user_id', $user->id);
            })->with(['fromUser', 'toUser'])
              ->latest()
              ->first();

            // Contar mensajes no leídos del otro usuario
            $unreadCount = DirectMessage::where('from_user_id', $otherUser->id)
                ->where('to_user_id', $user->id)
                ->where('read', false)
                ->count();

            return [
                'id' => $otherUser->id,
                'user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->full_name,
                    'username' => $otherUser->username,
                    'avatar' => $otherUser->avatar_url,
                    'online' => $otherUser->last_login_at && $otherUser->last_login_at->diffInMinutes(now()) < 5
                ],
                'lastMessage' => $lastMessage ? $lastMessage->message : null,
                'time' => $lastMessage ? $lastMessage->created_at->diffForHumans() : null,
                'unreadCount' => $unreadCount,
                'isFromMe' => $lastMessage ? $lastMessage->from_user_id === $user->id : false
            ];
        })->sortByDesc(function ($conversation) {
            return $conversation['lastMessage'] ? $conversation['time'] : null;
        })->values();

        return response()->json([
            'conversations' => $conversationsData
        ]);
    }
}
