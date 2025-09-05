<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('livestreams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('streamer_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category');
            $table->string('programming_language')->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['scheduled', 'live', 'ended', 'cancelled'])->default('scheduled');
            $table->enum('privacy', ['public', 'unlisted', 'private'])->default('public');
            $table->string('stream_key')->unique();
            $table->string('rtmp_url')->nullable();
            $table->string('playback_url')->nullable();
            $table->integer('max_participants')->default(100);
            $table->boolean('allow_chat')->default(true);
            $table->boolean('allow_code_collaboration')->default(false);
            $table->boolean('allow_screen_control')->default(false);
            $table->json('allowed_languages')->nullable();
            $table->integer('current_viewers')->default(0);
            $table->integer('peak_viewers')->default(0);
            $table->integer('total_views')->default(0);
            $table->integer('likes_count')->default(0);
            $table->decimal('total_tips', 10, 2)->default(0);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->boolean('tips_enabled')->default(false);
            $table->decimal('min_tip_amount', 8, 2)->nullable();
            $table->string('tip_currency', 3)->default('USD');
            $table->boolean('subscribers_only')->default(false);
            $table->boolean('auto_record')->default(false);
            $table->string('recording_url')->nullable();
            $table->integer('recording_size_mb')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'privacy']);
            $table->index(['category', 'programming_language']);
            $table->index('scheduled_at');
            $table->index('streamer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livestreams');
    }
};
