<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Tabla principal de streams
        Schema::create('live_streams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('streamer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->default('coding'); // coding, tutorial, review, etc.
            $table->string('programming_language')->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['scheduled', 'live', 'ended', 'cancelled'])->default('scheduled');
            $table->enum('privacy', ['public', 'unlisted', 'private'])->default('public');
            
            // Configuración técnica
            $table->string('stream_key')->unique();
            $table->string('rtmp_url')->nullable();
            $table->string('playback_url')->nullable();
            $table->integer('max_participants')->default(10);
            $table->boolean('allow_chat')->default(true);
            $table->boolean('allow_code_collaboration')->default(false);
            $table->boolean('allow_screen_control')->default(false);
            $table->json('allowed_languages')->nullable(); // Para el editor
            
            // Métricas
            $table->integer('current_viewers')->default(0);
            $table->integer('peak_viewers')->default(0);
            $table->integer('total_views')->default(0);
            $table->integer('likes_count')->default(0);
            $table->decimal('total_tips', 10, 2)->default(0);
            
            // Timestamps de streaming
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            
            // Configuración de monetización
            $table->boolean('tips_enabled')->default(false);
            $table->decimal('min_tip_amount', 8, 2)->default(1.00);
            $table->string('tip_currency', 3)->default('USD');
            $table->boolean('subscribers_only')->default(false);
            
            // Configuración de grabación
            $table->boolean('auto_record')->default(false);
            $table->string('recording_url')->nullable();
            $table->integer('recording_size_mb')->nullable();
            
            $table->timestamps();
            
            // Índices
            $table->index(['streamer_id', 'status']);
            $table->index(['category', 'status']);
            $table->index(['scheduled_at', 'status']);
        });

        // Participantes del stream
        Schema::create('stream_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stream_id')->constrained('live_streams')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['viewer', 'moderator', 'collaborator', 'co-host'])->default('viewer');
            $table->boolean('can_edit_code')->default(false);
            $table->boolean('can_control_screen')->default(false);
            $table->boolean('is_muted')->default(false);
            $table->boolean('is_banned')->default(false);
            $table->timestamp('joined_at');
            $table->timestamp('left_at')->nullable();
            $table->integer('watch_time_seconds')->default(0);
            $table->timestamps();
            
            $table->unique(['stream_id', 'user_id']);
            $table->index(['stream_id', 'role']);
        });

        // Chat del stream
        Schema::create('stream_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stream_id')->constrained('live_streams')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['message', 'system', 'tip', 'reaction'])->default('message');
            $table->text('content');
            $table->json('metadata')->nullable(); // Para tips, reacciones, etc.
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('deleted_at')->nullable();
            $table->timestamps();
            
            $table->index(['stream_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        // Sesiones de código colaborativo
        Schema::create('collaborative_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stream_id')->constrained('live_streams')->cascadeOnDelete();
            $table->string('session_id')->unique();
            $table->json('initial_code')->nullable();
            $table->json('current_code')->nullable();
            $table->string('language')->default('javascript');
            $table->string('theme')->default('dark');
            $table->json('cursor_positions')->nullable();
            $table->json('selections')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Operaciones del editor en tiempo real
        Schema::create('code_operations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('collaborative_sessions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['insert', 'delete', 'replace', 'cursor_move', 'selection']);
            $table->integer('position')->nullable();
            $table->integer('length')->nullable();
            $table->text('content')->nullable();
            $table->json('metadata')->nullable();
            $table->integer('operation_id'); // Para orden
            $table->timestamps();
            
            $table->index(['session_id', 'operation_id']);
        });

        // Tips y donaciones
        Schema::create('stream_tips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stream_id')->constrained('live_streams')->cascadeOnDelete();
            $table->foreignId('tipper_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('streamer_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 8, 2);
            $table->string('currency', 3)->default('USD');
            $table->text('message')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('payment_method')->nullable();
            $table->string('payment_id')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamps();
            
            $table->index(['stream_id', 'created_at']);
            $table->index(['streamer_id', 'status']);
        });

        // Grabaciones de streams
        Schema::create('stream_recordings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stream_id')->constrained('live_streams')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('video_url');
            $table->string('thumbnail_url')->nullable();
            $table->integer('duration_seconds');
            $table->integer('file_size_mb');
            $table->string('video_format')->default('mp4');
            $table->string('video_quality')->default('1080p');
            $table->boolean('is_public')->default(true);
            $table->boolean('is_processed')->default(false);
            $table->integer('views_count')->default(0);
            $table->timestamps();
            
            $table->index(['stream_id', 'is_public']);
        });

        // Suscripciones premium para streamers
        Schema::create('streamer_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscriber_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('streamer_id')->constrained('users')->cascadeOnDelete();
            $table->enum('tier', ['basic', 'premium', 'vip'])->default('basic');
            $table->decimal('amount', 8, 2);
            $table->string('currency', 3)->default('USD');
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'yearly'])->default('monthly');
            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');
            $table->timestamp('expires_at');
            $table->json('benefits')->nullable(); // Beneficios del tier
            $table->timestamps();
            
            $table->unique(['subscriber_id', 'streamer_id']);
            $table->index(['streamer_id', 'status']);
        });

        // Analytics detallados
        Schema::create('stream_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stream_id')->constrained('live_streams')->cascadeOnDelete();
            $table->date('date');
            $table->integer('hour')->nullable(); // 0-23 para analytics por hora
            $table->integer('unique_viewers')->default(0);
            $table->integer('peak_concurrent')->default(0);
            $table->integer('messages_count')->default(0);
            $table->integer('tips_count')->default(0);
            $table->decimal('tips_amount', 10, 2)->default(0);
            $table->integer('new_followers')->default(0);
            $table->integer('code_operations')->default(0);
            $table->json('viewer_countries')->nullable();
            $table->json('viewer_devices')->nullable();
            $table->decimal('average_watch_time', 8, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['stream_id', 'date', 'hour']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('stream_analytics');
        Schema::dropIfExists('streamer_subscriptions');
        Schema::dropIfExists('stream_recordings');
        Schema::dropIfExists('stream_tips');
        Schema::dropIfExists('code_operations');
        Schema::dropIfExists('collaborative_sessions');
        Schema::dropIfExists('stream_messages');
        Schema::dropIfExists('stream_participants');
        Schema::dropIfExists('live_streams');
    }
};