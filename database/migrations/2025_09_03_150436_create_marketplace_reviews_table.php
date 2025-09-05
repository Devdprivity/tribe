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
        Schema::create('marketplace_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('marketplace_purchases')->onDelete('cascade');
            $table->foreignId('reviewer_id')->constrained('users')->onDelete('cascade'); // comprador
            $table->foreignId('product_id')->constrained('marketplace_products')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            
            // Review Content
            $table->decimal('rating', 3, 2); // 1.00 - 5.00
            $table->string('title');
            $table->text('review');
            $table->json('rating_breakdown')->nullable(); // {code_quality: 5, documentation: 4, support: 5}
            
            // Review Categories (detailed ratings)
            $table->integer('code_quality_rating')->nullable(); // 1-5
            $table->integer('documentation_rating')->nullable(); // 1-5
            $table->integer('support_rating')->nullable(); // 1-5
            $table->integer('value_for_money_rating')->nullable(); // 1-5
            $table->integer('ease_of_use_rating')->nullable(); // 1-5
            
            // Status & Moderation
            $table->enum('status', ['pending', 'approved', 'rejected', 'reported', 'hidden'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->boolean('verified_purchase')->default(true); // siempre true para marketplace
            
            // Engagement
            $table->integer('helpful_count')->default(0); // "útil" votes
            $table->integer('not_helpful_count')->default(0);
            $table->json('helpful_users')->nullable(); // IDs de usuarios que votaron útil
            
            // Seller Response
            $table->text('seller_response')->nullable();
            $table->timestamp('seller_responded_at')->nullable();
            $table->boolean('seller_response_helpful')->nullable(); // comprador marca si fue útil
            
            // Media & Evidence
            $table->json('images')->nullable(); // screenshots del proyecto funcionando
            $table->json('videos')->nullable(); // videos de review/demo
            $table->text('pros')->nullable(); // aspectos positivos
            $table->text('cons')->nullable(); // aspectos negativos
            $table->text('recommendation')->nullable(); // recomendación final
            
            // Fraud Prevention
            $table->boolean('flagged_fake')->default(false);
            $table->text('flag_reason')->nullable();
            $table->json('authenticity_indicators')->nullable(); // indicadores de autenticidad
            
            // Timeline
            $table->integer('days_after_purchase')->nullable(); // días después de compra
            $table->boolean('updated_review')->default(false); // si fue editado después
            $table->timestamp('last_updated_at')->nullable();
            
            $table->timestamps();
            
            // Unique constraint - un review por purchase
            $table->unique('purchase_id');
            
            // Indexes
            $table->index(['product_id', 'status', 'rating']);
            $table->index(['seller_id', 'rating']);
            $table->index(['reviewer_id', 'created_at']);
            $table->index(['status', 'flagged_fake']);
            $table->index('verified_purchase');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_reviews');
    }
};
