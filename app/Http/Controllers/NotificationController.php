<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Mostrar todas las notificaciones del usuario
     */
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->with('fromUser')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications
        ]);
    }

    /**
     * Obtener notificaciones no leídas (para el panel)
     */
    public function unread(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->unread()
            ->with('fromUser')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $unreadCount = $request->user()
            ->notifications()
            ->unread()
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    /**
     * Marcar notificación como leída
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        // Verificar que la notificación pertenece al usuario
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Marcar todas las notificaciones como leídas
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->notifications()
            ->unread()
            ->update([
                'read' => true,
                'read_at' => now()
            ]);

        return response()->json(['success' => true]);
    }

    /**
     * Eliminar una notificación
     */
    public function destroy(Request $request, Notification $notification)
    {
        // Verificar que la notificación pertenece al usuario
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Eliminar todas las notificaciones leídas
     */
    public function destroyRead(Request $request)
    {
        $request->user()
            ->notifications()
            ->read()
            ->delete();

        return response()->json(['success' => true]);
    }
}
