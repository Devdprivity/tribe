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
        Schema::create('marketplace_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            
            // Basic Product Info
            $table->string('title');
            $table->text('description');
            $table->text('short_description');
            $table->decimal('price', 10, 2);
            $table->enum('currency', ['USD', 'EUR', 'GBP'])->default('USD');
            
            // Product Type & Category
            $table->enum('type', [
                'frontend', 'backend', 'fullstack', 'mobile', 
                'wordpress', 'plugin', 'theme', 'automation', 
                'api', 'library', 'template', 'other'
            ]);
            $table->enum('category', [
                'web_development', 'mobile_development', 'desktop_application',
                'cms_theme', 'wordpress_plugin', 'automation_script',
                'api_integration', 'ui_template', 'database_design', 'other'
            ]);
            
            // Technical Details
            $table->json('tech_stack'); // ['PHP', 'Laravel', 'Vue.js', etc.]
            $table->json('features'); // Lista de características principales
            $table->enum('complexity', ['basic', 'intermediate', 'advanced', 'expert']);
            
            // Repository & Demo Info
            $table->string('github_repo')->nullable(); // usuario/repo
            $table->boolean('github_verified')->default(false);
            $table->timestamp('github_last_verified')->nullable();
            $table->string('demo_url')->nullable();
            $table->string('live_preview_url')->nullable();
            $table->json('demo_credentials')->nullable(); // {username, password} para demos privados
            
            // Media & Documentation
            $table->json('images'); // URLs de imágenes del proyecto
            $table->json('videos')->nullable(); // URLs de videos demostrativos
            $table->text('installation_guide')->nullable();
            $table->text('documentation_url')->nullable();
            
            // Sales & Status
            $table->enum('status', ['draft', 'pending_review', 'active', 'paused', 'rejected', 'banned'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->integer('sales_count')->default(0);
            $table->integer('views_count')->default(0);
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            
            // Delivery & Support
            $table->enum('delivery_method', ['github_release', 'zip_file', 'git_access']);
            $table->boolean('includes_support')->default(false);
            $table->integer('support_duration_days')->nullable(); // días de soporte incluido
            $table->json('included_files'); // tipos de archivos incluidos
            
            // SEO & Marketing
            $table->json('tags')->nullable(); // tags para búsqueda
            $table->string('slug')->unique();
            $table->boolean('featured')->default(false);
            $table->timestamp('featured_until')->nullable();
            
            // Business Logic
            $table->boolean('allow_refunds')->default(true);
            $table->integer('refund_period_days')->default(7);
            $table->decimal('commission_rate', 5, 2)->default(10.00); // % que toma la plataforma
            
            $table->timestamps();
            
            // Indexes para performance
            $table->index(['status', 'featured']);
            $table->index(['type', 'category']);
            $table->index(['seller_id', 'status']);
            $table->index('github_repo');
            // $table->fullText(['title', 'description', 'short_description']); // Not supported by SQLite
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_products');
    }
};
