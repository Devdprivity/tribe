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
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('title');
            $table->text('description');
            $table->json('requirements')->nullable();
            $table->string('salary_range')->nullable();
            $table->string('location')->nullable();
            $table->boolean('remote_friendly')->default(false);
            $table->foreignId('posted_by')->constrained('users')->onDelete('cascade');
            $table->integer('applications_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índices para optimización
            $table->index(['posted_by', 'created_at']);
            $table->index(['is_active', 'created_at']);
            $table->index('remote_friendly');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
};
