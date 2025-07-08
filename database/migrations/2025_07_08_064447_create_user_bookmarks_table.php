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
        Schema::create('user_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('bookmarkable'); // Crea bookmarkable_type y bookmarkable_id
            $table->timestamps();

            // Índices para mejorar el rendimiento
            $table->index(['user_id', 'bookmarkable_type', 'bookmarkable_id']);
            $table->unique(['user_id', 'bookmarkable_type', 'bookmarkable_id'], 'unique_user_bookmark');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_bookmarks');
    }
};
