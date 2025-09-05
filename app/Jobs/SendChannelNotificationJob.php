<?php

namespace App\Jobs;

use App\Models\Channel;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendChannelNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     */
    public int $maxExceptions = 2;

    /**
     * Batch size for database inserts
     */
    private const BATCH_SIZE = 100;

    public function __construct(
        private User $fromUser,
        private Post $post,
        private Channel $channel
    ) {
        $this->onQueue('notifications');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Processing channel notification job', [
                'channel_id' => $this->channel->id,
                'post_id' => $this->post->id,
                'from_user_id' => $this->fromUser->id
            ]);

            // Get all member IDs except the author
            $memberIds = $this->channel->members()
                ->where('user_id', '!=', $this->fromUser->id)
                ->pluck('user_id')
                ->toArray();

            if (empty($memberIds)) {
                Log::info('No members to notify for channel', [
                    'channel_id' => $this->channel->id
                ]);
                return;
            }

            // Prepare batch notifications
            $notifications = $this->prepareNotifications($memberIds);

            // Insert in batches to avoid memory issues and query size limits
            $this->insertNotificationsBatch($notifications);

            Log::info('Channel notification job completed', [
                'channel_id' => $this->channel->id,
                'post_id' => $this->post->id,
                'members_notified' => count($memberIds)
            ]);

        } catch (\Exception $e) {
            Log::error('Channel notification job failed', [
                'channel_id' => $this->channel->id,
                'post_id' => $this->post->id,
                'from_user_id' => $this->fromUser->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e; // Re-throw to trigger job retry
        }
    }

    /**
     * Prepare notification data for batch insert
     */
    private function prepareNotifications(array $memberIds): array
    {
        $notifications = [];
        $now = now();
        $messagePreview = substr($this->post->content, 0, 50) . '...';

        foreach ($memberIds as $memberId) {
            $notifications[] = [
                'user_id' => $memberId,
                'from_user_id' => $this->fromUser->id,
                'type' => 'channel_new_post',
                'title' => 'Nueva publicación en canal',
                'message' => "@{$this->fromUser->username} publicó en {$this->channel->name}: \"{$messagePreview}\"",
                'data' => json_encode([
                    'post_id' => $this->post->id,
                    'channel_id' => $this->channel->id
                ]),
                'link' => "/posts/{$this->post->id}",
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        return $notifications;
    }

    /**
     * Insert notifications in batches
     */
    private function insertNotificationsBatch(array $notifications): void
    {
        $chunks = array_chunk($notifications, self::BATCH_SIZE);
        
        foreach ($chunks as $chunkIndex => $chunk) {
            try {
                Notification::insert($chunk);
                
                Log::debug('Notification batch inserted', [
                    'batch' => $chunkIndex + 1,
                    'size' => count($chunk),
                    'channel_id' => $this->channel->id
                ]);
                
                // Small delay between batches to reduce database load
                if (count($chunks) > 1 && $chunkIndex < count($chunks) - 1) {
                    usleep(100000); // 100ms delay
                }
                
            } catch (\Exception $e) {
                Log::error('Failed to insert notification batch', [
                    'batch' => $chunkIndex + 1,
                    'channel_id' => $this->channel->id,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Channel notification job failed permanently', [
            'channel_id' => $this->channel->id,
            'post_id' => $this->post->id,
            'from_user_id' => $this->fromUser->id,
            'error' => $exception->getMessage()
        ]);
    }
}