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
        Schema::create('credit_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->cascadeOnDelete();
            $table->string('action', 50); // view_consumed, click_consumed, bonus_added, credits_removed, credits_reset, reactivated, suspended, unsuspended, expired
            $table->string('credit_type', 20)->default('system'); // view, click, both, system
            $table->integer('views_change')->default(0);
            $table->integer('clicks_change')->default(0);
            $table->integer('views_before')->nullable();
            $table->integer('views_after')->nullable();
            $table->integer('clicks_before')->nullable();
            $table->integer('clicks_after')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reason', 500)->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['auto_school_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_histories');
    }
};
