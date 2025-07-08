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
        if (!Schema::hasTable('posts')) {
            Schema::create('posts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->text('content');
                $table->enum('type', ['text', 'image', 'video', 'code', 'project'])->default('text');
                $table->string('code_language')->nullable();
                $table->json('media_urls')->nullable();
                $table->integer('likes_count')->default(0);
                $table->integer('comments_count')->default(0);
                $table->integer('shares_count')->default(0);
                $table->boolean('is_pinned')->default(false);
                $table->timestamps();

                // Índices para optimización
                $table->index(['user_id', 'created_at']);
                $table->index(['type', 'created_at']);
                $table->index('is_pinned');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
