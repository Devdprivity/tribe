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
                        AND table_name = 'comments'
                    )
                ");
                $tableExists = $tableExists[0]->exists;
            } else {
                // SQLite, MySQL, etc.
                $tableExists = Schema::hasTable('comments');
            }
        } catch (Exception $e) {
            // Si hay algún error, asumimos que la tabla no existe
            $tableExists = false;
        }

        if (!$tableExists) {
            Schema::create('comments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->foreignId('post_id')->constrained()->onDelete('cascade');
                $table->text('content');
                $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');
                $table->timestamps();
            });

            // Crear índices después de que la tabla exista
            Schema::table('comments', function (Blueprint $table) {
                $table->index(['post_id', 'created_at']);
                $table->index(['user_id', 'created_at']);
                $table->index('parent_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
