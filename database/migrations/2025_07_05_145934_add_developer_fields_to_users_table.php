<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Primero agregamos las nuevas columnas como nullable
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->after('id');
            }
            if (!Schema::hasColumn('users', 'full_name')) {
                $table->string('full_name')->nullable()->after('username');
            }
        });

        // Migramos los datos existentes
        DB::table('users')->whereNull('username')->orWhereNull('full_name')->orderBy('id')->chunk(100, function ($users) {
            foreach ($users as $user) {
                $username = Str::slug($user->name);
                $baseUsername = $username;
                $counter = 1;

                // Asegurarse de que el username sea único
                while (DB::table('users')->where('username', $username)->where('id', '!=', $user->id)->exists()) {
                    $username = $baseUsername . $counter;
                    $counter++;
                }

                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'username' => $username,
                        'full_name' => $user->name
                    ]);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            // Hacer las columnas not null después de migrar los datos
            if (Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable(false)->unique()->change();
            }
            if (Schema::hasColumn('users', 'full_name')) {
                $table->string('full_name')->nullable(false)->change();
            }

            // Eliminar la columna name después de migrar los datos
            if (Schema::hasColumn('users', 'name')) {
                $table->dropColumn('name');
            }

            // Agregar los campos específicos para desarrolladores solo si no existen
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('bio');
            }
            if (!Schema::hasColumn('users', 'level')) {
                $table->enum('level', ['junior', 'mid', 'senior', 'lead'])->default('junior')->after('avatar');
            }
            if (!Schema::hasColumn('users', 'years_experience')) {
                $table->integer('years_experience')->default(0)->after('level');
            }
            if (!Schema::hasColumn('users', 'location')) {
                $table->string('location')->nullable()->after('years_experience');
            }
            if (!Schema::hasColumn('users', 'website')) {
                $table->string('website')->nullable()->after('location');
            }
            if (!Schema::hasColumn('users', 'github_username')) {
                $table->string('github_username')->nullable()->after('website');
            }
            if (!Schema::hasColumn('users', 'linkedin_profile')) {
                $table->string('linkedin_profile')->nullable()->after('github_username');
            }
            if (!Schema::hasColumn('users', 'is_open_to_work')) {
                $table->boolean('is_open_to_work')->default(false)->after('linkedin_profile');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Primero agregamos name como nullable
            $table->string('name')->nullable()->after('id');
        });

        // Restaurar los datos
        DB::table('users')->whereNull('name')->orderBy('id')->chunk(100, function ($users) {
            foreach ($users as $user) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['name' => $user->full_name]);
            }
        });

        Schema::table('users', function (Blueprint $table) {
            // Hacer name not null después de restaurar los datos
            $table->string('name')->nullable(false)->change();

            // Eliminar campos específicos para desarrolladores
            $table->dropColumn([
                'username',
                'full_name',
                'bio',
                'avatar',
                'level',
                'years_experience',
                'location',
                'website',
                'github_username',
                'linkedin_profile',
                'is_open_to_work'
            ]);
        });
    }
};
