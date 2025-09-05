<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Stories Técnicos
        Schema::create('tech_stories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['code_snippet', 'progress_update', 'tip', 'bug_fix', 'achievement', 'question']);
            $table->string('title');
            $table->text('content')->nullable();
            $table->json('code_data')->nullable(); // Para snippets de código
            $table->string('programming_language')->nullable();
            $table->json('media_urls')->nullable(); // Imágenes, videos, GIFs
            $table->string('background_color')->default('#1a1a1a');
            $table->boolean('is_interactive')->default(false); // Si el código es ejecutable
            $table->integer('duration_seconds')->default(24); // Duración personalizable
            $table->timestamp('expires_at');
            $table->integer('views_count')->default(0);
            $table->integer('likes_count')->default(0);
            $table->integer('shares_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('tags')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_active', 'expires_at']);
            $table->index(['type', 'programming_language']);
        });

        // Interacciones con Stories
        Schema::create('story_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained('tech_stories')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['view', 'like', 'share', 'comment', 'fork']);
            $table->text('content')->nullable(); // Para comentarios
            $table->json('metadata')->nullable(); // Para datos adicionales
            $table->timestamps();

            $table->unique(['story_id', 'user_id', 'type']);
        });

        // Sistema de Eventos y Meetups
        Schema::create('tech_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['meetup', 'hackathon', 'conference', 'workshop', 'code_review', 'interview_prep', 'study_group']);
            $table->enum('format', ['virtual', 'hybrid', 'in_person']);
            $table->string('location')->nullable(); // Para eventos presenciales
            $table->string('virtual_link')->nullable(); // Para eventos virtuales
            $table->datetime('starts_at');
            $table->datetime('ends_at');
            $table->string('timezone')->default('UTC');
            $table->integer('max_attendees')->nullable();
            $table->decimal('price', 8, 2)->default(0); // Eventos pueden ser pagos
            $table->string('currency', 3)->default('USD');
            $table->json('technologies')->nullable(); // Tech stack del evento
            $table->json('requirements')->nullable(); // Requisitos para participar
            $table->string('difficulty_level')->nullable(); // beginner, intermediate, advanced
            $table->boolean('requires_approval')->default(false);
            $table->boolean('is_recurring')->default(false);
            $table->json('recurrence_pattern')->nullable();
            $table->string('cover_image')->nullable();
            $table->json('agenda')->nullable(); // Agenda del evento
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('draft');
            $table->boolean('allow_recording')->default(false);
            $table->string('recording_url')->nullable();
            $table->timestamps();

            $table->index(['organizer_id', 'status']);
            $table->index(['type', 'starts_at']);
            $table->index(['format', 'status']);
        });

        // Asistentes a Eventos
        Schema::create('event_attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('tech_events')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['registered', 'approved', 'rejected', 'attended', 'no_show'])->default('registered');
            $table->text('registration_notes')->nullable();
            $table->json('answers')->nullable(); // Respuestas a preguntas del organizador
            $table->timestamp('registered_at');
            $table->timestamp('attended_at')->nullable();
            $table->integer('rating')->nullable(); // Rating del evento (1-5)
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
        });

        // Sistema de Desafíos de Programación
        Schema::create('coding_challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->text('problem_statement');
            $table->json('test_cases'); // Casos de prueba
            $table->json('example_inputs')->nullable();
            $table->json('example_outputs')->nullable();
            $table->json('constraints')->nullable();
            $table->string('difficulty')->default('medium'); // easy, medium, hard, expert
            $table->json('categories')->nullable(); // algorithms, data-structures, web, etc.
            $table->json('allowed_languages'); // Lenguajes permitidos
            $table->integer('time_limit_seconds')->default(3600); // 1 hour default
            $table->integer('memory_limit_mb')->default(256);
            $table->text('hints')->nullable();
            $table->json('starter_code')->nullable(); // Código base por lenguaje
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_published')->default(false);
            $table->integer('points_reward')->default(100);
            $table->integer('submissions_count')->default(0);
            $table->integer('successful_submissions')->default(0);
            $table->decimal('success_rate', 5, 2)->default(0);
            $table->timestamps();

            $table->index(['difficulty', 'is_published']);
            $table->index(['creator_id', 'is_published']);
        });

        // Soluciones a Desafíos
        Schema::create('challenge_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('coding_challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('programming_language');
            $table->longText('code');
            $table->enum('status', ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit', 'memory_limit', 'runtime_error', 'compilation_error']);
            $table->json('test_results')->nullable(); // Resultados de cada test case
            $table->integer('execution_time_ms')->nullable();
            $table->integer('memory_used_mb')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('score')->nullable(); // Puntaje obtenido
            $table->boolean('is_best_submission')->default(false);
            $table->json('code_metrics')->nullable(); // Complejidad, líneas, etc.
            $table->timestamps();

            $table->index(['challenge_id', 'user_id', 'status']);
            $table->index(['user_id', 'is_best_submission']);
        });

        // Sistema de Mentorías
        Schema::create('mentorship_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mentor_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->json('expertise_areas'); // Areas de expertise
            $table->json('technologies'); // Tecnologías que enseña
            $table->enum('format', ['one_on_one', 'group', 'hybrid']);
            $table->integer('max_mentees')->default(5);
            $table->integer('duration_weeks');
            $table->decimal('price_per_session', 8, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->integer('session_duration_minutes')->default(60);
            $table->json('schedule_availability')->nullable(); // Horarios disponibles
            $table->string('timezone')->default('UTC');
            $table->json('requirements')->nullable(); // Requisitos para mentees
            $table->text('learning_outcomes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->integer('completed_programs')->default(0);
            $table->timestamps();

            $table->index(['mentor_id', 'is_active']);
            $table->index(['rating', 'is_active']);
        });

        // Sesiones de Mentoría
        Schema::create('mentorship_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('mentorship_programs')->cascadeOnDelete();
            $table->foreignId('mentor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('mentee_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->datetime('scheduled_at');
            $table->integer('duration_minutes');
            $table->string('meeting_link')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']);
            $table->text('mentor_notes')->nullable();
            $table->text('mentee_notes')->nullable();
            $table->json('goals')->nullable(); // Objetivos de la sesión
            $table->json('homework')->nullable(); // Tareas asignadas
            $table->integer('mentor_rating')->nullable();
            $table->integer('mentee_rating')->nullable();
            $table->text('mentor_feedback')->nullable();
            $table->text('mentee_feedback')->nullable();
            $table->string('recording_url')->nullable();
            $table->timestamps();

            $table->index(['mentor_id', 'scheduled_at']);
            $table->index(['mentee_id', 'scheduled_at']);
        });

        // Job Board Inteligente
        Schema::create('job_opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('users')->cascadeOnDelete(); // Company user
            $table->string('title');
            $table->text('description');
            $table->text('requirements');
            $table->text('responsibilities');
            $table->json('required_skills'); // Skills requeridas
            $table->json('preferred_skills')->nullable(); // Skills deseables
            $table->json('tech_stack'); // Stack tecnológico
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'freelance', 'internship']);
            $table->enum('experience_level', ['entry', 'junior', 'mid', 'senior', 'lead', 'principal']);
            $table->enum('work_mode', ['remote', 'hybrid', 'on_site']);
            $table->string('location')->nullable();
            $table->string('timezone')->nullable();
            $table->decimal('salary_min', 10, 2)->nullable();
            $table->decimal('salary_max', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->enum('salary_period', ['hourly', 'daily', 'monthly', 'yearly'])->default('yearly');
            $table->json('benefits')->nullable();
            $table->boolean('visa_sponsorship')->default(false);
            $table->date('application_deadline')->nullable();
            $table->integer('positions_available')->default(1);
            $table->enum('status', ['draft', 'published', 'paused', 'closed'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->integer('views_count')->default(0);
            $table->integer('applications_count')->default(0);
            $table->timestamps();

            $table->index(['company_id', 'status']);
            $table->index(['employment_type', 'work_mode', 'status']);
            $table->index(['experience_level', 'status']);
        });

        // Aplicaciones de Trabajo - Table already exists from previous migration
        // if (!Schema::hasTable('job_applications')) {
        //     Schema::create('job_applications', function (Blueprint $table) {
        //     $table->id();
        //     $table->foreignId('job_id')->constrained('job_opportunities')->cascadeOnDelete();
        //     $table->foreignId('applicant_id')->constrained('users')->cascadeOnDelete();
        //     $table->text('cover_letter')->nullable();
        //     $table->string('resume_url')->nullable();
        //     $table->string('portfolio_url')->nullable();
        //     $table->json('answers')->nullable(); // Respuestas a preguntas específicas
        //     $table->enum('status', ['applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn']);
        //     $table->json('interview_stages')->nullable(); // Etapas de entrevista
        //     $table->text('recruiter_notes')->nullable();
        //     $table->decimal('ai_match_score', 5, 2)->nullable(); // Score de AI matching
        //     $table->json('skills_match')->nullable(); // Análisis de skills matching
        //     $table->timestamps();

        //     $table->unique(['job_id', 'applicant_id']);
        //     $table->index(['applicant_id', 'status']);
        //     });
        // }

        // Sistema de Skills y Endorsements
        Schema::create('user_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('skill_name');
            $table->enum('category', ['programming_language', 'framework', 'tool', 'soft_skill', 'methodology']);
            $table->integer('proficiency_level')->default(1); // 1-10
            $table->integer('years_experience')->nullable();
            $table->integer('endorsements_count')->default(0);
            $table->boolean('is_verified')->default(false); // Verificado por tests/certificates
            $table->text('evidence')->nullable(); // Enlaces a proyectos que demuestran la skill
            $table->timestamps();

            $table->unique(['user_id', 'skill_name']);
            $table->index(['skill_name', 'proficiency_level']);
        });

        // Endorsements de Skills
        Schema::create('skill_endorsements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_id')->constrained('user_skills')->cascadeOnDelete();
            $table->foreignId('endorser_id')->constrained('users')->cascadeOnDelete();
            $table->text('comment')->nullable();
            $table->integer('credibility_weight')->default(1); // Peso basado en la experiencia del endorser
            $table->timestamps();

            $table->unique(['skill_id', 'endorser_id']);
        });

        // Sistema de Achievements/Badges
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('category'); // coding, community, learning, mentoring, etc.
            $table->string('icon');
            $table->string('color')->default('#3b82f6');
            $table->json('criteria'); // Criterios para obtener el achievement
            $table->boolean('is_rare')->default(false);
            $table->integer('points_value')->default(100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // User Achievements
        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained()->cascadeOnDelete();
            $table->timestamp('earned_at');
            $table->json('evidence')->nullable(); // Data que llevó a obtener el achievement
            $table->boolean('is_displayed')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'achievement_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('skill_endorsements');
        Schema::dropIfExists('user_skills');
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('job_opportunities');
        Schema::dropIfExists('mentorship_sessions');
        Schema::dropIfExists('mentorship_programs');
        Schema::dropIfExists('challenge_submissions');
        Schema::dropIfExists('coding_challenges');
        Schema::dropIfExists('event_attendees');
        Schema::dropIfExists('tech_events');
        Schema::dropIfExists('story_interactions');
        Schema::dropIfExists('tech_stories');
    }
};