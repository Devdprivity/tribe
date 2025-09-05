<?php

namespace App\Services;

use App\Models\LiveStream;
use App\Models\User;
use App\Models\StreamParticipant;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class StreamingService
{
    /**
     * Crear un nuevo stream
     */
    public function createStream(User $user, array $data): LiveStream
    {
        $streamKey = 'live_' . Str::random(32);
        
        $stream = LiveStream::create([
            'streamer_id' => $user->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'],
            'programming_language' => $data['programming_language'] ?? null,
            'tags' => $data['tags'] ?? [],
            'privacy' => $data['privacy'],
            'stream_key' => $streamKey,
            'rtmp_url' => $this->generateRtmpUrl($streamKey),
            'playback_url' => $this->generatePlaybackUrl($streamKey),
            'max_participants' => $data['max_participants'] ?? 100,
            'allow_chat' => $data['allow_chat'] ?? true,
            'allow_code_collaboration' => $data['allow_code_collaboration'] ?? false,
            'allow_screen_control' => $data['allow_screen_control'] ?? false,
            'tips_enabled' => $data['tips_enabled'] ?? false,
            'min_tip_amount' => ($data['tips_enabled'] ?? false) ? ($data['min_tip_amount'] ?? null) : null,
            'subscribers_only' => $data['subscribers_only'] ?? false,
            'auto_record' => $data['auto_record'] ?? false,
            'scheduled_at' => $data['scheduled_at'] ?? null,
            'status' => $data['scheduled_at'] ? 'scheduled' : 'live',
        ]);

        return $stream;
    }

    /**
     * Generar URL RTMP para streaming
     */
    private function generateRtmpUrl(string $streamKey): string
    {
        $rtmpServer = config('streaming.rtmp_server', 'rtmp://localhost:1935/live');
        return $rtmpServer . '/' . $streamKey;
    }

    /**
     * Generar URL de playback para reproducción
     */
    private function generatePlaybackUrl(string $streamKey): string
    {
        // En modo de desarrollo, usar video de prueba si está habilitado
        if (config('streaming.use_test_stream', true)) {
            return config('streaming.test_stream_url', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        }
        
        $hlsServer = config('streaming.hls_server', 'http://localhost:8080/hls');
        return $hlsServer . '/' . $streamKey . '/index.m3u8';
    }

    /**
     * Verificar si un usuario puede ver un stream
     */
    public function canUserView(User $user, LiveStream $stream): bool
    {
        if ($stream->privacy === 'public') {
            return true;
        }

        if ($stream->privacy === 'unlisted') {
            return true; // Los streams unlisted son visibles con enlace directo
        }

        if ($stream->privacy === 'private') {
            return $stream->streamer_id === $user->id;
        }

        return false;
    }

    /**
     * Verificar si un usuario puede unirse a un stream
     */
    public function canUserJoin(User $user, LiveStream $stream): bool
    {
        return $stream->canUserJoin($user);
    }

    /**
     * Unirse a un stream
     */
    public function joinStream(User $user, LiveStream $stream): ?StreamParticipant
    {
        if (!$this->canUserJoin($user, $stream)) {
            return null;
        }

        return $stream->addParticipant($user, 'viewer');
    }

    /**
     * Salir de un stream
     */
    public function leaveStream(User $user, LiveStream $stream): void
    {
        $stream->removeParticipant($user);
    }

    /**
     * Iniciar un stream
     */
    public function startStream(LiveStream $stream): void
    {
        // Regenerar URLs si no existen
        if (empty($stream->rtmp_url) || empty($stream->playback_url)) {
            $stream->update([
                'rtmp_url' => $this->generateRtmpUrl($stream->stream_key),
                'playback_url' => $this->generatePlaybackUrl($stream->stream_key),
            ]);
        }

        $stream->startStream();
        
        Log::info('Stream started', [
            'stream_id' => $stream->id,
            'streamer_id' => $stream->streamer_id,
            'title' => $stream->title,
            'rtmp_url' => $stream->rtmp_url,
            'playback_url' => $stream->playback_url
        ]);
    }

    /**
     * Terminar un stream
     */
    public function endStream(LiveStream $stream): void
    {
        $stream->endStream();
        
        Log::info('Stream ended', [
            'stream_id' => $stream->id,
            'streamer_id' => $stream->streamer_id,
            'duration' => $stream->duration
        ]);
    }
}