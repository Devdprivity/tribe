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

            // Verificar si el índice existe antes de crearlo
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes('users');
            $indexName = 'users_provider_provider_id_index';

            if (!array_key_exists($indexName, $indexes)) {
                $table->index(['provider', 'provider_id']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Verificar si el índice existe antes de eliminarlo
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $indexes = $sm->listTableIndexes('users');
            $indexName = 'users_provider_provider_id_index';

            if (array_key_exists($indexName, $indexes)) {
                $table->dropIndex(['provider', 'provider_id']);
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
