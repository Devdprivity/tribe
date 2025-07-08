<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Notification;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Channel;
use App\Models\DirectMessage;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Obtener usuarios existentes
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->info('No hay usuarios para crear notificaciones. Ejecuta UserSeeder primero.');
            return;
        }

        $user1 = $users->first();
        $user2 = $users->skip(1)->first() ?? $user1;

        // Crear notificaciones de ejemplo
        $notifications = [
            [
                'user_id' => $user1->id,
                'type' => 'post_like',
                'title' => 'Nuevo like en tu post',
                'message' => $user2->name . ' le dio like a tu publicación',
                'from_user_id' => $user2->id,
                'data' => ['post_id' => 1],
                'link' => '/posts/1',
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'post_comment',
                'title' => 'Nuevo comentario',
                'message' => $user2->name . ' comentó en tu publicación',
                'from_user_id' => $user2->id,
                'data' => ['post_id' => 1, 'comment_id' => 1],
                'link' => '/posts/1',
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'comment_reply',
                'title' => 'Respuesta a tu comentario',
                'message' => $user2->name . ' respondió a tu comentario',
                'from_user_id' => $user2->id,
                'data' => ['post_id' => 1, 'comment_id' => 1, 'reply_id' => 2],
                'link' => '/posts/1',
                'read' => true,
                'read_at' => now(),
            ],
            [
                'user_id' => $user1->id,
                'type' => 'user_follow',
                'title' => 'Nuevo seguidor',
                'message' => $user2->name . ' comenzó a seguirte',
                'from_user_id' => $user2->id,
                'data' => ['follower_id' => $user2->id],
                'link' => '/users/' . $user2->id,
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'channel_join',
                'title' => 'Nuevo miembro en canal',
                'message' => $user2->name . ' se unió al canal Laravel Developers',
                'from_user_id' => $user2->id,
                'data' => ['channel_id' => 1, 'channel_name' => 'Laravel Developers'],
                'link' => '/channels/1',
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'channel_invite',
                'title' => 'Invitación a canal',
                'message' => 'Has sido invitado a unirte al canal React Developers',
                'from_user_id' => $user2->id,
                'data' => ['channel_id' => 2, 'channel_name' => 'React Developers'],
                'link' => '/channels/2',
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'mention',
                'title' => 'Mencionado en un post',
                'message' => $user2->name . ' te mencionó en una publicación',
                'from_user_id' => $user2->id,
                'data' => ['post_id' => 2],
                'link' => '/posts/2',
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'job_application',
                'title' => 'Nueva aplicación de trabajo',
                'message' => $user2->name . ' aplicó a tu oferta de trabajo',
                'from_user_id' => $user2->id,
                'data' => ['job_id' => 1, 'application_id' => 1],
                'link' => '/jobs/1/applications',
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'job_status_change',
                'title' => 'Estado de aplicación actualizado',
                'message' => 'Tu aplicación para "Desarrollador Full Stack" ha sido revisada',
                'from_user_id' => $user2->id,
                'data' => ['job_id' => 1, 'status' => 'reviewed'],
                'link' => '/my-applications',
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'system',
                'title' => 'Bienvenido a Tribe',
                'message' => '¡Gracias por unirte a nuestra comunidad de desarrolladores!',
                'data' => ['welcome' => true],
                'link' => '/dashboard',
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'channel_new_post',
                'title' => 'Nuevo post en canal',
                'message' => $user2->name . ' publicó algo nuevo en Laravel Developers',
                'from_user_id' => $user2->id,
                'data' => ['channel_id' => 1, 'channel_name' => 'Laravel Developers', 'post_id' => 3],
                'link' => '/posts/3',
                'read' => false,
            ],
            [
                'user_id' => $user1->id,
                'type' => 'direct_message',
                'title' => 'Nuevo mensaje directo',
                'message' => $user2->name . ' te envió un mensaje: "¡Hola! ¿Cómo va todo?"',
                'from_user_id' => $user2->id,
                'data' => ['message_preview' => '¡Hola! ¿Cómo va todo?'],
                'link' => '/messages/' . $user2->id,
                'read' => false,
            ],
        ];

        foreach ($notifications as $notificationData) {
            Notification::create($notificationData);
        }

        $this->command->info('Notificaciones de ejemplo creadas exitosamente.');
    }
}
