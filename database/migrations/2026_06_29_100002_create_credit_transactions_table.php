<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->cascadeOnDelete();
            $table->string('credit_type', 20);
            // consumed|added|removed|reset|renewal|blocked|unblocked|set_unlimited|remove_unlimited|exhausted|reactivated|suspended|unsuspended
            $table->string('action', 30);
            $table->integer('amount')->default(0); // positive=added, negative=consumed/removed
            $table->integer('balance_before')->nullable();
            $table->integer('balance_after')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason', 500)->nullable();
            $table->text('notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['auto_school_id', 'created_at']);
            $table->index(['auto_school_id', 'credit_type', 'created_at']);
            $table->index(['auto_school_id', 'action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_transactions');
    }
};
