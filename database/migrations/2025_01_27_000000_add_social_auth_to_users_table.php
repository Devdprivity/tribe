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
            if (!Schema::hasColumn('users', 'provider')) {
                $table->string('provider')->nullable()->after('email_verified_at');
            }
            if (!Schema::hasColumn('users', 'provider_id')) {
                $table->string('provider_id')->nullable()->after('provider');
            }
            if (!Schema::hasColumn('users', 'provider_avatar')) {
                $table->string('provider_avatar')->nullable()->after('provider_id');
            }
            if (!Schema::hasColumn('users', 'provider_data')) {
                $table->json('provider_data')->nullable()->after('provider_avatar');
            }
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('provider_data');
            }

            // Intentar crear el índice - si ya existe, PostgreSQL lo manejará silenciosamente
            try {
                $table->index(['provider', 'provider_id']);
            } catch (\Exception $e) {
                // El índice probablemente ya existe, podemos ignorar el error
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Intentar eliminar el índice - si no existe, PostgreSQL lo manejará silenciosamente
            try {
                $table->dropIndex(['provider', 'provider_id']);
            } catch (\Exception $e) {
                // El índice probablemente no existe, podemos ignorar el error
            }

            // Eliminar columnas solo si existen
            $columns = ['provider', 'provider_id', 'provider_avatar', 'provider_data', 'last_login_at'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
