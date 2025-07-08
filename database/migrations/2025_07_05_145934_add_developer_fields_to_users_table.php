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
            // Cambiar name por username y full_name
            $table->string('username')->unique()->after('id');
            $table->string('full_name')->after('username');
            $table->dropColumn('name');

            // Campos específicos para desarrolladores
            $table->text('bio')->nullable()->after('email');
            $table->string('avatar')->nullable()->after('bio');
            $table->enum('level', ['junior', 'mid', 'senior', 'lead'])->default('junior')->after('avatar');
            $table->integer('years_experience')->default(0)->after('level');
            $table->string('location')->nullable()->after('years_experience');
            $table->string('website')->nullable()->after('location');
            $table->string('github_username')->nullable()->after('website');
            $table->string('linkedin_profile')->nullable()->after('github_username');
            $table->boolean('is_open_to_work')->default(false)->after('linkedin_profile');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Restaurar campo name
            $table->string('name')->after('id');

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
