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
        Schema::create('marketplace_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('marketplace_purchases')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // quien recibe/envía dinero
            
            // Transaction Details
            $table->string('transaction_id')->unique(); // TXN-2025-000001
            $table->enum('type', [
                'payment', 'commission', 'payout', 'refund', 
                'chargeback', 'adjustment', 'fee'
            ]);
            $table->enum('direction', ['in', 'out']); // dinero entrando o saliendo
            
            // Amounts
            $table->decimal('amount', 10, 2);
            $table->decimal('fee_amount', 10, 2)->default(0); // fees de payment processor
            $table->decimal('net_amount', 10, 2); // amount - fee_amount
            $table->string('currency', 3)->default('USD');
            
            // Status & Processing
            $table->enum('status', [
                'pending', 'processing', 'completed', 'failed', 
                'cancelled', 'reversed', 'disputed'
            ])->default('pending');
            $table->string('gateway')->nullable(); // stripe, paypal, etc.
            $table->string('gateway_transaction_id')->nullable();
            $table->json('gateway_response')->nullable(); // respuesta completa del gateway
            
            // Escrow Management (para seguridad de compra/venta)
            $table->boolean('held_in_escrow')->default(false);
            $table->timestamp('escrow_release_date')->nullable(); // cuándo se libera automáticamente
            $table->timestamp('released_from_escrow_at')->nullable();
            $table->text('escrow_release_reason')->nullable();
            
            // Metadata & Notes
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // info adicional
            $table->text('failure_reason')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('next_retry_at')->nullable();
            
            // Reconciliation (para contabilidad)
            $table->boolean('reconciled')->default(false);
            $table->timestamp('reconciled_at')->nullable();
            $table->string('reconciliation_reference')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['purchase_id', 'type']);
            $table->index(['user_id', 'status']);
            $table->index(['transaction_id']);
            $table->index(['gateway_transaction_id']);
            $table->index(['status', 'held_in_escrow']);
            $table->index('escrow_release_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_transactions');
    }
};
