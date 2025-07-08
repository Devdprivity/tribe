<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Channel;
use App\Models\Job;

class NotificationService
{
    /**
     * Crear notificación de like en post
     */
    public static function postLiked(User $fromUser, Post $post): void
    {
        // No notificar si el usuario se da like a sí mismo
        if ($fromUser->id === $post->user_id) {
            return;
        }

        Notification::create([
            'user_id' => $post->user_id,
            'from_user_id' => $fromUser->id,
            'type' => 'post_like',
            'title' => 'Nuevo like en tu post',
            'message' => "@{$fromUser->username} le dio like a tu post",
            'data' => [
                'post_id' => $post->id,
                'like_type' => 'like'
            ],
            'link' => "/posts/{$post->id}"
        ]);
    }

    /**
     * Crear notificación de comentario en post
     */
    public static function postCommented(User $fromUser, Post $post, Comment $comment): void
    {
        // No notificar si el usuario comenta en su propio post
        if ($fromUser->id === $post->user_id) {
            return;
        }

        Notification::create([
            'user_id' => $post->user_id,
            'from_user_id' => $fromUser->id,
            'type' => 'post_comment',
            'title' => 'Nuevo comentario en tu post',
            'message' => "@{$fromUser->username} comentó en tu post: \"" . substr($comment->content, 0, 50) . "...\"",
            'data' => [
                'post_id' => $post->id,
                'comment_id' => $comment->id
            ],
            'link' => "/posts/{$post->id}#comment-{$comment->id}"
        ]);
    }

    /**
     * Crear notificación de like en comentario
     */
    public static function commentLiked(User $fromUser, Comment $comment): void
    {
        // No notificar si el usuario se da like a sí mismo
        if ($fromUser->id === $comment->user_id) {
            return;
        }

        Notification::create([
            'user_id' => $comment->user_id,
            'from_user_id' => $fromUser->id,
            'type' => 'comment_like',
            'title' => 'Nuevo like en tu comentario',
            'message' => "@{$fromUser->username} le dio like a tu comentario",
            'data' => [
                'post_id' => $comment->post_id,
                'comment_id' => $comment->id
            ],
            'link' => "/posts/{$comment->post_id}#comment-{$comment->id}"
        ]);
    }

    /**
     * Crear notificación de respuesta a comentario
     */
    public static function commentReplied(User $fromUser, Comment $parentComment, Comment $reply): void
    {
        // No notificar si el usuario responde a su propio comentario
        if ($fromUser->id === $parentComment->user_id) {
            return;
        }

        Notification::create([
            'user_id' => $parentComment->user_id,
            'from_user_id' => $fromUser->id,
            'type' => 'comment_reply',
            'title' => 'Nueva respuesta a tu comentario',
            'message' => "@{$fromUser->username} respondió a tu comentario: \"" . substr($reply->content, 0, 50) . "...\"",
            'data' => [
                'post_id' => $parentComment->post_id,
                'parent_comment_id' => $parentComment->id,
                'reply_id' => $reply->id
            ],
            'link' => "/posts/{$parentComment->post_id}#comment-{$reply->id}"
        ]);
    }

    /**
     * Crear notificación de nuevo seguidor
     */
    public static function userFollowed(User $fromUser, User $followedUser): void
    {
        // No notificar si el usuario se sigue a sí mismo
        if ($fromUser->id === $followedUser->id) {
            return;
        }

        Notification::create([
            'user_id' => $followedUser->id,
            'from_user_id' => $fromUser->id,
            'type' => 'user_follow',
            'title' => 'Nuevo seguidor',
            'message' => "@{$fromUser->username} empezó a seguirte",
            'data' => [
                'follower_id' => $fromUser->id
            ],
            'link' => "/profile/{$fromUser->username}"
        ]);
    }

    /**
     * Crear notificación de unión a canal
     */
    public static function channelJoined(User $user, Channel $channel): void
    {
        // Notificar al creador del canal
        if ($user->id === $channel->created_by) {
            return;
        }

        Notification::create([
            'user_id' => $channel->created_by,
            'from_user_id' => $user->id,
            'type' => 'channel_join',
            'title' => 'Nuevo miembro en tu canal',
            'message' => "@{$user->username} se unió a tu canal {$channel->name}",
            'data' => [
                'channel_id' => $channel->id,
                'member_id' => $user->id
            ],
            'link' => "/channels/{$channel->slug}"
        ]);
    }

    /**
     * Crear notificación de invitación a canal
     */
    public static function channelInvited(User $fromUser, User $invitedUser, Channel $channel): void
    {
        Notification::create([
            'user_id' => $invitedUser->id,
            'from_user_id' => $fromUser->id,
            'type' => 'channel_invite',
            'title' => 'Invitación a canal',
            'message' => "@{$fromUser->username} te invitó a unirte al canal {$channel->name}",
            'data' => [
                'channel_id' => $channel->id,
                'inviter_id' => $fromUser->id
            ],
            'link' => "/channels/{$channel->slug}"
        ]);
    }

    /**
     * Crear notificación de mención
     */
    public static function userMentioned(User $fromUser, User $mentionedUser, string $context, array $data = []): void
    {
        // No notificar si el usuario se menciona a sí mismo
        if ($fromUser->id === $mentionedUser->id) {
            return;
        }

        Notification::create([
            'user_id' => $mentionedUser->id,
            'from_user_id' => $fromUser->id,
            'type' => 'mention',
            'title' => 'Te mencionaron',
            'message' => "@{$fromUser->username} te mencionó en {$context}",
            'data' => $data,
            'link' => $data['link'] ?? null
        ]);
    }

    /**
     * Crear notificación de aplicación a trabajo
     */
    public static function jobApplied(User $applicant, Job $job): void
    {
        // No notificar si el usuario aplica a su propio trabajo
        if ($applicant->id === $job->posted_by) {
            return;
        }

        Notification::create([
            'user_id' => $job->posted_by,
            'from_user_id' => $applicant->id,
            'type' => 'job_application',
            'title' => 'Nueva aplicación a tu trabajo',
            'message' => "@{$applicant->username} aplicó a tu trabajo \"{$job->title}\"",
            'data' => [
                'job_id' => $job->id,
                'applicant_id' => $applicant->id
            ],
            'link' => "/jobs/{$job->id}/applications"
        ]);
    }

    /**
     * Crear notificación de cambio de estado en aplicación
     */
    public static function jobStatusChanged(User $applicant, Job $job, string $status): void
    {
        $statusMessages = [
            'reviewed' => 'tu aplicación está siendo revisada',
            'interview' => 'te han invitado a una entrevista',
            'accepted' => 'tu aplicación fue aceptada',
            'rejected' => 'tu aplicación no fue seleccionada'
        ];

        $message = $statusMessages[$status] ?? 'el estado de tu aplicación cambió';

        Notification::create([
            'user_id' => $applicant->id,
            'from_user_id' => $job->posted_by,
            'type' => 'job_status_change',
            'title' => 'Actualización de aplicación',
            'message' => "Para el trabajo \"{$job->title}\", {$message}",
            'data' => [
                'job_id' => $job->id,
                'status' => $status
            ],
            'link' => "/jobs/{$job->id}"
        ]);
    }

    /**
     * Crear notificación de nueva publicación en canal
     */
    public static function channelNewPost(User $fromUser, Post $post, Channel $channel): void
    {
        // Notificar a todos los miembros del canal excepto al autor
        $channel->members()
            ->where('user_id', '!=', $fromUser->id)
            ->get()
            ->each(function ($member) use ($fromUser, $post, $channel) {
                Notification::create([
                    'user_id' => $member->id,
                    'from_user_id' => $fromUser->id,
                    'type' => 'channel_new_post',
                    'title' => 'Nueva publicación en canal',
                    'message' => "@{$fromUser->username} publicó en {$channel->name}: \"" . substr($post->content, 0, 50) . "...\"",
                    'data' => [
                        'post_id' => $post->id,
                        'channel_id' => $channel->id
                    ],
                    'link' => "/posts/{$post->id}"
                ]);
            });
    }

    /**
     * Crear notificación de mensaje directo
     */
    public static function directMessage(User $fromUser, User $toUser, string $message): void
    {
        Notification::create([
            'user_id' => $toUser->id,
            'from_user_id' => $fromUser->id,
            'type' => 'direct_message',
            'title' => 'Nuevo mensaje directo',
            'message' => "@{$fromUser->username} te envió un mensaje: \"" . substr($message, 0, 50) . "...\"",
            'data' => [
                'from_user_id' => $fromUser->id,
                'message_preview' => substr($message, 0, 100)
            ],
            'link' => "/messages/{$fromUser->id}"
        ]);
    }

    /**
     * Crear notificación del sistema
     */
    public static function systemNotification(User $user, string $title, string $message, array $data = []): void
    {
        Notification::create([
            'user_id' => $user->id,
            'from_user_id' => null,
            'type' => 'system',
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'link' => $data['link'] ?? null
        ]);
    }
}
