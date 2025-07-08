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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Usuario que recibe la notificación
            $table->foreignId('from_user_id')->nullable()->constrained('users')->onDelete('cascade'); // Usuario que genera la notificación
            $table->enum('type', [
                'post_like',           // Like en un post
                'post_comment',        // Comentario en un post
                'comment_like',        // Like en un comentario
                'comment_reply',       // Respuesta a un comentario
                'user_follow',         // Usuario te sigue
                'channel_join',        // Usuario se une a un canal
                'channel_invite',      // Invitación a un canal
                'channel_new_post',    // Nueva publicación en canal
                'direct_message',      // Mensaje directo
                'mention',             // Menciones en posts/comentarios
                'job_application',     // Aplicación a un trabajo
                'job_status_change',   // Cambio de estado en aplicación
                'system'               // Notificaciones del sistema
            ]);
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Datos adicionales (IDs de posts, comentarios, etc.)
            $table->string('link')->nullable(); // Enlace para ir a la notificación
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Índices para optimización
            $table->index(['user_id', 'read']);
            $table->index(['user_id', 'created_at']);
            $table->index(['type', 'created_at']);
            $table->index('from_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
