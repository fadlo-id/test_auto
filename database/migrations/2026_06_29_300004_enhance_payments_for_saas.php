<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('invoice_number', 30)->nullable()->unique()->after('description');
            $table->decimal('vat_rate', 5, 2)->default(20.00)->after('invoice_number');
            $table->decimal('vat_amount', 10, 2)->nullable()->after('vat_rate');
            $table->decimal('net_amount', 10, 2)->nullable()->after('vat_amount');
            $table->decimal('refunded_amount', 10, 2)->default(0)->after('net_amount');
            $table->string('refund_reason', 500)->nullable()->after('refunded_amount');
            $table->string('stripe_refund_id')->nullable()->after('refund_reason');
            $table->unsignedTinyInteger('retry_count')->default(0)->after('stripe_refund_id');
            $table->timestamp('next_retry_at')->nullable()->after('retry_count');
            $table->string('failure_code', 100)->nullable()->after('next_retry_at');
            $table->string('failure_message', 500)->nullable()->after('failure_code');
            $table->enum('payment_type', ['subscription', 'upgrade', 'renewal', 'trial_conversion'])
                  ->default('subscription')->after('failure_message');

            $table->index('invoice_number', 'idx_payments_invoice');
            $table->index('payment_type', 'idx_payments_type');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_invoice');
            $table->dropIndex('idx_payments_type');
            $table->dropColumn([
                'invoice_number', 'vat_rate', 'vat_amount', 'net_amount',
                'refunded_amount', 'refund_reason', 'stripe_refund_id',
                'retry_count', 'next_retry_at', 'failure_code', 'failure_message',
                'payment_type',
            ]);
        });
    }
};
