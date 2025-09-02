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
        // Verificar si la tabla existe de manera compatible con múltiples bases de datos
        $tableExists = false;
        
        try {
            if (DB::connection()->getDriverName() === 'pgsql') {
                // PostgreSQL
                $tableExists = DB::select("
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables
                        WHERE table_schema = 'public'
                        AND table_name = 'posts'
                    )
                ");
                $tableExists = $tableExists[0]->exists;
            } else {
                // SQLite, MySQL, etc.
                $tableExists = Schema::hasTable('posts');
            }
        } catch (Exception $e) {
            // Si hay algún error, asumimos que la tabla no existe
            $tableExists = false;
        }

        if (!$tableExists) {
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
