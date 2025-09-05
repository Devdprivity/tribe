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
        Schema::create('marketplace_disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('marketplace_purchases')->onDelete('cascade');
            $table->foreignId('disputer_id')->constrained('users')->onDelete('cascade'); // quien abre la disputa
            $table->foreignId('disputed_against_id')->constrained('users')->onDelete('cascade'); // contra quien
            $table->foreignId('assigned_admin_id')->nullable()->constrained('users');
            
            // Dispute Details
            $table->string('dispute_number')->unique(); // DISP-2025-000001
            $table->enum('type', [
                'not_delivered', 'not_as_described', 'defective_product', 
                'unauthorized_purchase', 'billing_error', 'copyright_violation',
                'seller_fraud', 'buyer_fraud', 'technical_issue', 'other'
            ]);
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            
            // Content & Evidence
            $table->string('title');
            $table->text('description');
            $table->json('evidence_files')->nullable(); // screenshots, videos, etc.
            $table->json('evidence_urls')->nullable(); // links externos
            $table->text('expected_resolution')->nullable(); // qué espera el disputante
            
            // Status & Processing
            $table->enum('status', [
                'open', 'investigating', 'waiting_response', 'escalated',
                'resolved', 'closed', 'cancelled', 'expired'
            ])->default('open');
            $table->text('admin_notes')->nullable();
            $table->json('status_history')->nullable(); // historial de cambios de estado
            
            // Resolution
            $table->enum('resolution', [
                'refund_full', 'refund_partial', 'replacement', 'credit', 
                'no_action', 'seller_favor', 'buyer_favor', 'mutual_agreement'
            ])->nullable();
            $table->text('resolution_notes')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->timestamp('resolved_at')->nullable();
            
            // Timeline & Deadlines
            $table->timestamp('response_deadline')->nullable(); // plazo para responder
            $table->timestamp('resolution_deadline')->nullable(); // plazo para resolver
            $table->timestamp('expires_at')->nullable(); // cuándo expira automáticamente
            $table->boolean('auto_resolved')->default(false);
            
            // Communication
            $table->boolean('seller_notified')->default(false);
            $table->boolean('buyer_notified')->default(false);
            $table->timestamp('last_seller_response')->nullable();
            $table->timestamp('last_buyer_response')->nullable();
            
            // Fraud Detection
            $table->json('fraud_indicators')->nullable(); // indicadores de fraude detectados
            $table->boolean('flagged_as_fraud')->default(false);
            $table->text('fraud_reason')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['purchase_id', 'status']);
            $table->index(['disputer_id', 'status']);
            $table->index(['disputed_against_id', 'status']);
            $table->index(['assigned_admin_id', 'status']);
            $table->index('dispute_number');
            $table->index(['type', 'priority']);
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_disputes');
    }
};
