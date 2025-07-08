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
        Schema::table('notifications', function (Blueprint $table) {
            // Modificar el enum para incluir los nuevos tipos
            DB::statement("ALTER TABLE notifications DROP CONSTRAINT notifications_type_check");
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('post_like', 'post_comment', 'comment_like', 'comment_reply', 'user_follow', 'channel_join', 'channel_invite', 'channel_new_post', 'direct_message', 'mention', 'job_application', 'job_status_change', 'system'))");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Revertir a los tipos originales
            DB::statement("ALTER TABLE notifications DROP CONSTRAINT notifications_type_check");
            DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('post_like', 'post_comment', 'comment_like', 'comment_reply', 'user_follow', 'channel_join', 'channel_invite', 'mention', 'job_application', 'job_status_change', 'system'))");
        });
    }
};
