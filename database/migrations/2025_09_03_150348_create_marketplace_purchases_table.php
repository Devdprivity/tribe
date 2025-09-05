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
        Schema::create('marketplace_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('marketplace_products')->onDelete('cascade');
            
            // Purchase Details
            $table->string('order_number')->unique(); // ORD-2025-000001
            $table->decimal('amount', 10, 2); // Precio al momento de compra
            $table->decimal('commission_amount', 10, 2); // Comisión de la plataforma
            $table->decimal('seller_amount', 10, 2); // Cantidad que recibe el vendedor
            $table->string('currency', 3)->default('USD');
            
            // Payment & Status
            $table->enum('status', [
                'pending_payment', 'paid', 'processing', 'completed', 
                'cancelled', 'refunded', 'disputed', 'failed'
            ])->default('pending_payment');
            $table->string('payment_method')->nullable(); // stripe, paypal, etc.
            $table->string('payment_intent_id')->nullable(); // ID del payment intent
            $table->json('payment_metadata')->nullable(); // metadata del pago
            
            // Delivery & Access
            $table->enum('delivery_status', [
                'pending', 'preparing', 'delivered', 'failed', 'cancelled'
            ])->default('pending');
            $table->timestamp('delivered_at')->nullable();
            $table->json('delivery_data')->nullable(); // URLs descarga, credenciales repo, etc.
            $table->string('download_token')->nullable(); // Token único para descargas
            $table->integer('download_attempts')->default(0);
            $table->timestamp('first_download_at')->nullable();
            $table->timestamp('last_download_at')->nullable();
            
            // Business Logic
            $table->boolean('can_dispute')->default(true);
            $table->timestamp('dispute_deadline')->nullable(); // 7 días después de entrega
            $table->boolean('review_submitted')->default(false);
            $table->timestamp('review_deadline')->nullable(); // 30 días para reseña
            
            // Support & Communication
            $table->boolean('support_active')->default(false);
            $table->timestamp('support_expires_at')->nullable();
            $table->text('buyer_notes')->nullable(); // Notas del comprador
            $table->text('seller_notes')->nullable(); // Notas del vendedor
            
            // Refund Management
            $table->boolean('refund_requested')->default(false);
            $table->timestamp('refund_requested_at')->nullable();
            $table->text('refund_reason')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->timestamp('refunded_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['buyer_id', 'status']);
            $table->index(['seller_id', 'status']);
            $table->index(['product_id', 'status']);
            $table->index('order_number');
            $table->index('payment_intent_id');
            $table->index('download_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_purchases');
    }
};
