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
        Schema::table('users', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('email_verified_at');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('provider_avatar')->nullable()->after('provider_id');
            $table->json('provider_data')->nullable()->after('provider_avatar');
            $table->timestamp('last_login_at')->nullable()->after('provider_data');

            // Index para búsquedas por provider
            $table->index(['provider', 'provider_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['provider', 'provider_id']);
            $table->dropColumn([
                'provider',
                'provider_id',
                'provider_avatar',
                'provider_data',
                'last_login_at'
            ]);
        });
    }
};
