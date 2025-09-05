<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Channel;
use App\Models\Job;
use App\Jobs\SendChannelNotificationJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Exception;

class NotificationService
{
    /**
     * Batch size for bulk notification inserts
     */
    private const BATCH_SIZE = 100;
    
    /**
     * Channel member threshold for queuing
     */
    private const QUEUE_THRESHOLD = 50;
    /**
     * Crear notificación de like en post
     */
    public function postLiked(User $fromUser, Post $post): void
    {
        try {
            // No notificar si el usuario se da like a sí mismo
            if ($fromUser->id === $post->user_id) {
                return;
            }

            $this->createNotification([
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
        } catch (Exception $e) {
            Log::error('Failed to create post like notification', [
                'from_user_id' => $fromUser->id,
                'post_id' => $post->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Crear notificación de comentario en post
     */
    public function postCommented(User $fromUser, Post $post, Comment $comment): void
    {
        try {
            // No notificar si el usuario comenta en su propio post
            if ($fromUser->id === $post->user_id) {
                return;
            }

            $this->createNotification([
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
        } catch (Exception $e) {
            Log::error('Failed to create post comment notification', [
                'from_user_id' => $fromUser->id,
                'post_id' => $post->id,
                'comment_id' => $comment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Crear notificación de like en comentario
     */
    public function commentLiked(User $fromUser, Comment $comment): void
    {
        // No notificar si el usuario se da like a sí mismo
        if ($fromUser->id === $comment->user_id) {
            return;
        }

        $this->createNotification([
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
    public function commentReplied(User $fromUser, Comment $parentComment, Comment $reply): void
    {
        // No notificar si el usuario responde a su propio comentario
        if ($fromUser->id === $parentComment->user_id) {
            return;
        }

        $this->createNotification([
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
    public function userFollowed(User $fromUser, User $followedUser): void
    {
        // No notificar si el usuario se sigue a sí mismo
        if ($fromUser->id === $followedUser->id) {
            return;
        }

        $this->createNotification([
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
    public function channelJoined(User $user, Channel $channel): void
    {
        // Notificar al creador del canal
        if ($user->id === $channel->created_by) {
            return;
        }

        $this->createNotification([
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
    public function channelInvited(User $fromUser, User $invitedUser, Channel $channel): void
    {
        $this->createNotification([
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
    public function userMentioned(User $fromUser, User $mentionedUser, string $context, array $data = []): void
    {
        // No notificar si el usuario se menciona a sí mismo
        if ($fromUser->id === $mentionedUser->id) {
            return;
        }

        $this->createNotification([
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
    public function jobApplied(User $applicant, Job $job): void
    {
        // No notificar si el usuario aplica a su propio trabajo
        if ($applicant->id === $job->posted_by) {
            return;
        }

        $this->createNotification([
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
    public function jobStatusChanged(User $applicant, Job $job, string $status): void
    {
        $statusMessages = [
            'reviewed' => 'tu aplicación está siendo revisada',
            'interview' => 'te han invitado a una entrevista',
            'accepted' => 'tu aplicación fue aceptada',
            'rejected' => 'tu aplicación no fue seleccionada'
        ];

        $message = $statusMessages[$status] ?? 'el estado de tu aplicación cambió';

        $this->createNotification([
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
     * Crear notificación de nueva publicación en canal - OPTIMIZADO PARA OCTANE
     */
    public function channelNewPost(User $fromUser, Post $post, Channel $channel): void
    {
        try {
            // Get member count first to decide strategy
            $memberCount = $channel->members()->where('user_id', '!=', $fromUser->id)->count();
            
            if ($memberCount === 0) {
                return;
            }
            
            // Use queuing for large channels to avoid blocking
            if ($memberCount > self::QUEUE_THRESHOLD) {
                $this->queueChannelNotification($fromUser, $post, $channel);
                return;
            }
            
            // For smaller channels, use batch insert
            $this->batchChannelNewPost($fromUser, $post, $channel);
            
        } catch (Exception $e) {
            Log::error('Failed to create channel new post notifications', [
                'from_user_id' => $fromUser->id,
                'post_id' => $post->id,
                'channel_id' => $channel->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Crear notificación de mensaje directo
     */
    public function directMessage(User $fromUser, User $toUser, string $message): void
    {
        $this->createNotification([
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
    public function systemNotification(User $user, string $title, string $message, array $data = []): void
    {
        try {
            $this->createNotification([
                'user_id' => $user->id,
                'from_user_id' => null,
                'type' => 'system',
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'link' => $data['link'] ?? null
            ]);
        } catch (Exception $e) {
            Log::error('Failed to create system notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Batch create notifications for channel posts (OCTANE OPTIMIZED)
     */
    private function batchChannelNewPost(User $fromUser, Post $post, Channel $channel): void
    {
        // Single query to get all member IDs
        $memberIds = $channel->members()
            ->where('user_id', '!=', $fromUser->id)
            ->pluck('user_id')
            ->toArray();
            
        if (empty($memberIds)) {
            return;
        }
        
        // Prepare batch notifications
        $notifications = [];
        $now = now();
        $messagePreview = substr($post->content, 0, 50) . '...';
        
        foreach ($memberIds as $memberId) {
            $notifications[] = [
                'user_id' => $memberId,
                'from_user_id' => $fromUser->id,
                'type' => 'channel_new_post',
                'title' => 'Nueva publicación en canal',
                'message' => "@{$fromUser->username} publicó en {$channel->name}: \"{$messagePreview}\"",
                'data' => json_encode([
                    'post_id' => $post->id,
                    'channel_id' => $channel->id
                ]),
                'link' => "/posts/{$post->id}",
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        // Batch insert in chunks to avoid query size limits
        $chunks = array_chunk($notifications, self::BATCH_SIZE);
        
        foreach ($chunks as $chunk) {
            Notification::insert($chunk);
        }
        
        Log::info('Batch channel notifications created', [
            'channel_id' => $channel->id,
            'post_id' => $post->id,
            'member_count' => count($memberIds)
        ]);
    }
    
    /**
     * Queue channel notification for large channels
     */
    private function queueChannelNotification(User $fromUser, Post $post, Channel $channel): void
    {
        try {
            // Dispatch job to background queue
            SendChannelNotificationJob::dispatch($fromUser, $post, $channel)
                ->delay(now()->addSeconds(2)); // Small delay to ensure post is fully saved
                
            Log::info('Channel notification queued for large channel', [
                'channel_id' => $channel->id,
                'post_id' => $post->id,
                'from_user_id' => $fromUser->id,
                'queue_used' => true
            ]);
        } catch (Exception $e) {
            Log::error('Failed to queue channel notification, falling back to batch', [
                'channel_id' => $channel->id,
                'post_id' => $post->id,
                'error' => $e->getMessage()
            ]);
            
            // Fallback to synchronous batch processing
            $this->batchChannelNewPost($fromUser, $post, $channel);
        }
    }
    
    /**
     * Unified notification creation with error handling
     */
    private function createNotification(array $data): void
    {
        // Ensure data is JSON encoded if it's an array
        if (isset($data['data']) && is_array($data['data'])) {
            $data['data'] = json_encode($data['data']);
        }
        
        Notification::create($data);
    }
}
