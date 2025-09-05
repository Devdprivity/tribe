<?php

namespace App\Console\Commands;

use App\Models\LiveStream;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class UpdateStreamUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'streaming:update-urls {--force : Force update all streams}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update streaming URLs for existing streams';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating streaming URLs...');

        $query = LiveStream::query();
        
        if (!$this->option('force')) {
            $query->where(function($q) {
                $q->whereNull('rtmp_url')
                  ->orWhereNull('playback_url')
                  ->orWhere('rtmp_url', '')
                  ->orWhere('playback_url', '');
            });
        }

        $streams = $query->get();
        
        if ($streams->isEmpty()) {
            $this->info('No streams need URL updates.');
            return 0;
        }

        $this->info("Found {$streams->count()} streams to update.");

        $bar = $this->output->createProgressBar($streams->count());
        $bar->start();

        foreach ($streams as $stream) {
            $stream->update([
                'rtmp_url' => $this->generateRtmpUrl($stream->stream_key),
                'playback_url' => $this->generatePlaybackUrl($stream->stream_key),
            ]);
            
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Successfully updated URLs for {$streams->count()} streams!");

        return 0;
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
        $hlsServer = config('streaming.hls_server', 'http://localhost:8080/hls');
        return $hlsServer . '/' . $streamKey . '/index.m3u8';
    }
}
