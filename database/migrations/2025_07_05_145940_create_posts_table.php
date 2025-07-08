<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Verificar si la tabla existe en PostgreSQL
        $tableExists = DB::select("
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'posts'
            )
        ");

        if (!$tableExists[0]->exists) {
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
            });

            // Crear índices después de que la tabla exista
            Schema::table('posts', function (Blueprint $table) {
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
