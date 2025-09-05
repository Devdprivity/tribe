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

        // Portfolios de Usuarios
        Schema::create('user_portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique(); // URL personalizada
            $table->string('title');
            $table->text('bio')->nullable();
            $table->string('tagline')->nullable(); // Frase destacada
            $table->json('specializations'); // Especializaciones principales
            $table->json('tech_stack'); // Stack tecnológico
            $table->string('avatar_url')->nullable();
            $table->string('resume_url')->nullable();
            $table->json('contact_info')->nullable(); // Email, LinkedIn, GitHub, etc.
            $table->json('social_links')->nullable(); // Enlaces a redes sociales
            $table->string('location')->nullable();
            $table->boolean('available_for_hire')->default(false);
            $table->json('preferred_work_types')->nullable(); // remote, full-time, contract, etc.
            $table->decimal('hourly_rate', 8, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->json('theme_settings')->nullable(); // Configuración de tema
            $table->boolean('is_public')->default(true);
            $table->boolean('seo_optimized')->default(false);
            $table->json('seo_meta')->nullable(); // Meta tags para SEO
            $table->integer('views_count')->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->timestamps();

            $table->index(['slug', 'is_public']);
            $table->index(['available_for_hire', 'is_public']);
        });

        // Proyectos del Portfolio
        Schema::create('portfolio_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained('user_portfolios')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->text('detailed_description')->nullable();
            $table->json('technologies'); // Tecnologías utilizadas
            $table->string('category'); // web, mobile, desktop, ai, etc.
            $table->enum('type', ['personal', 'professional', 'open_source', 'academic']);
            $table->string('status')->default('completed'); // in_progress, completed, archived
            $table->json('images')->nullable(); // URLs de imágenes del proyecto
            $table->string('live_url')->nullable(); // URL del proyecto en vivo
            $table->string('github_url')->nullable(); // Repositorio de GitHub
            $table->string('demo_video_url')->nullable(); // Video demo
            $table->json('features')->nullable(); // Características principales
            $table->json('challenges')->nullable(); // Retos superados
            $table->json('lessons_learned')->nullable(); // Aprendizajes
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('role')->nullable(); // Rol en el proyecto
            $table->json('team_members')->nullable(); // Miembros del equipo
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->integer('views_count')->default(0);
            $table->integer('likes_count')->default(0);
            $table->timestamps();

            $table->index(['portfolio_id', 'is_featured']);
            $table->index(['category', 'type']);
        });

        // Experiencia Laboral del Portfolio
        Schema::create('portfolio_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained('user_portfolios')->cascadeOnDelete();
            $table->string('company_name');
            $table->string('position');
            $table->text('description');
            $table->json('responsibilities')->nullable(); // Responsabilidades principales
            $table->json('achievements')->nullable(); // Logros destacados
            $table->json('technologies')->nullable(); // Tecnologías utilizadas
            $table->string('employment_type')->default('full_time'); // full_time, part_time, contract, etc.
            $table->string('location')->nullable();
            $table->boolean('is_remote')->default(false);
            $table->date('start_date');
            $table->date('end_date')->nullable(); // null = trabajo actual
            $table->string('company_url')->nullable();
            $table->string('company_logo')->nullable();
            $table->boolean('is_current')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['portfolio_id', 'is_current']);
        });

        // Educación del Portfolio
        Schema::create('portfolio_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained('user_portfolios')->cascadeOnDelete();
            $table->string('institution');
            $table->string('degree');
            $table->string('field_of_study')->nullable();
            $table->text('description')->nullable();
            $table->decimal('gpa', 3, 2)->nullable();
            $table->json('relevant_courses')->nullable();
            $table->json('achievements')->nullable(); // Honores, premios, etc.
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->string('institution_url')->nullable();
            $table->string('credential_url')->nullable(); // URL del diploma/certificado
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['portfolio_id', 'is_current']);
        });

        // Skills del Portfolio
        Schema::create('portfolio_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained('user_portfolios')->cascadeOnDelete();
            $table->string('skill_name');
            $table->string('category'); // programming, framework, tool, soft_skill, etc.
            $table->integer('proficiency_level')->default(5); // 1-10
            $table->integer('years_experience')->default(1);
            $table->boolean('is_primary')->default(false); // Skill principal
            $table->json('projects_used')->nullable(); // Proyectos donde se usó
            $table->json('certifications')->nullable(); // Certificaciones relacionadas
            $table->text('description')->nullable(); // Descripción del uso/experiencia
            $table->integer('endorsements_count')->default(0);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['portfolio_id', 'skill_name']);
            $table->index(['skill_name', 'proficiency_level']);
        });

        // Testimoniales/Recomendaciones
        Schema::create('portfolio_testimonials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained('user_portfolios')->cascadeOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_name'); // Por si el autor no está registrado
            $table->string('author_position')->nullable();
            $table->string('author_company')->nullable();
            $table->string('author_avatar')->nullable();
            $table->text('content');
            $table->integer('rating')->default(5); // 1-5
            $table->string('relationship'); // colleague, client, manager, etc.
            $table->json('skills_endorsed')->nullable(); // Skills específicas endosadas
            $table->boolean('is_approved')->default(false); // Requiere aprobación
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['portfolio_id', 'is_approved', 'is_featured']);
        });

        // Interacciones con Portfolios
        Schema::create('portfolio_interactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained('user_portfolios')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['view', 'like', 'share', 'contact', 'hire_inquiry']);
            $table->string('ip_address')->nullable();
            $table->text('message')->nullable(); // Para contact e hire_inquiry
            $table->json('metadata')->nullable(); // Datos adicionales
            $table->timestamps();

            $table->index(['portfolio_id', 'type']);
            $table->index(['user_id', 'type']);
        });

        // Analytics de Portfolios
        Schema::create('portfolio_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('portfolio_id')->constrained('user_portfolios')->cascadeOnDelete();
            $table->date('date');
            $table->integer('unique_views')->default(0);
            $table->integer('total_views')->default(0);
            $table->integer('project_views')->default(0);
            $table->integer('contact_clicks')->default(0);
            $table->integer('resume_downloads')->default(0);
            $table->json('top_referrers')->nullable();
            $table->json('visitor_countries')->nullable();
            $table->json('popular_projects')->nullable();
            $table->decimal('bounce_rate', 5, 2)->default(0);
            $table->integer('avg_time_spent')->default(0); // en segundos
            $table->timestamps();

            $table->unique(['portfolio_id', 'date']);
        });

        // Template de Certificados
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('template_file'); // Path al archivo de template
            $table->json('customizable_fields'); // Campos que se pueden personalizar
            $table->string('preview_image')->nullable();
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('certificate_templates');
        Schema::dropIfExists('portfolio_analytics');
        Schema::dropIfExists('portfolio_interactions');
        Schema::dropIfExists('portfolio_testimonials');
        Schema::dropIfExists('portfolio_skills');
        Schema::dropIfExists('portfolio_education');
        Schema::dropIfExists('portfolio_experiences');
        Schema::dropIfExists('portfolio_projects');
        Schema::dropIfExists('user_portfolios');
        Schema::dropIfExists('user_certifications');
        Schema::dropIfExists('user_certification_attempts');
        Schema::dropIfExists('certifications');
    }
};