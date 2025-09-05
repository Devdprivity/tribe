<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Certificaciones Disponibles
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('category'); // programming, web_development, data_science, etc.
            $table->string('level')->default('intermediate'); // beginner, intermediate, advanced, expert
            $table->json('skills_covered'); // Skills que cubre la certificación
            $table->json('prerequisites')->nullable(); // Requisitos previos
            $table->integer('duration_hours')->default(40); // Duración estimada de estudio
            $table->integer('passing_score')->default(70); // Puntuación mínima para aprobar
            $table->decimal('price', 8, 2)->default(0); // Precio de la certificación
            $table->string('currency', 3)->default('USD');
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('exam_structure'); // Estructura del examen
            $table->json('learning_path')->nullable(); // Ruta de aprendizaje sugerida
            $table->string('badge_image')->nullable();
            $table->string('certificate_template')->nullable();
            $table->integer('validity_months')->default(24); // Validez de la certificación
            $table->integer('max_attempts')->default(3); // Intentos máximos
            $table->timestamps();

            $table->index(['category', 'level', 'is_active']);
        });

        // Intentos de Certificación de Usuarios
        Schema::create('user_certification_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('certification_id')->constrained()->cascadeOnDelete();
            $table->integer('attempt_number');
            $table->enum('status', ['in_progress', 'completed', 'failed', 'expired']);
            $table->datetime('started_at');
            $table->datetime('completed_at')->nullable();
            $table->integer('score')->nullable();
            $table->json('section_scores')->nullable(); // Puntuaciones por sección
            $table->json('answers')->nullable(); // Respuestas del usuario
            $table->json('time_spent')->nullable(); // Tiempo por sección
            $table->integer('total_time_minutes')->nullable();
            $table->text('feedback')->nullable(); // Feedback automático
            $table->timestamps();

            $table->index(['user_id', 'certification_id', 'status']);
        });

        // Certificaciones Obtenidas
        Schema::create('user_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('certification_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attempt_id')->constrained('user_certification_attempts')->cascadeOnDelete();
            $table->string('certificate_number')->unique();
            $table->integer('score');
            $table->datetime('issued_at');
            $table->datetime('expires_at')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->string('verification_code')->unique();
            $table->json('skills_validated'); // Skills validadas con esta certificación
            $table->string('certificate_url')->nullable(); // URL del certificado PDF
            $table->boolean('is_public')->default(true); // Mostrar en perfil público
            $table->timestamps();

            $table->unique(['user_id', 'certification_id']);
            $table->index(['verification_code', 'is_verified']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_certifications');
        Schema::dropIfExists('user_certification_attempts');
        Schema::dropIfExists('certifications');
    }
};