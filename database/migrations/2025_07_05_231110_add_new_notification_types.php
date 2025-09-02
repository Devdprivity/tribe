<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            // PostgreSQL - usar ALTER TABLE con constraints
            Schema::table('notifications', function (Blueprint $table) {
                DB::statement("ALTER TABLE notifications DROP CONSTRAINT notifications_type_check");
                DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('post_like', 'post_comment', 'comment_like', 'comment_reply', 'user_follow', 'channel_join', 'channel_invite', 'channel_new_post', 'direct_message', 'mention', 'job_application', 'job_status_change', 'system'))");
            });
        } else {
            // SQLite, MySQL, etc. - recrear la tabla con el nuevo enum
            Schema::table('notifications', function (Blueprint $table) {
                // Para SQLite, no podemos modificar enums directamente
                // La migración se ejecutará pero no modificará el enum
                // En producción con PostgreSQL sí funcionará correctamente
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            // PostgreSQL
            Schema::table('notifications', function (Blueprint $table) {
                DB::statement("ALTER TABLE notifications DROP CONSTRAINT notifications_type_check");
                DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('post_like', 'post_comment', 'comment_like', 'comment_reply', 'user_follow', 'channel_join', 'channel_invite', 'mention', 'job_application', 'job_status_change', 'system'))");
            });
        }
        // Para SQLite no hay nada que revertir
    }
};
