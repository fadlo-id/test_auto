<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('auto_school_id');
            $table->string('credit_type', 10);    // view | click
            $table->integer('change');             // positive = added, negative = consumed
            $table->integer('balance_after')->nullable();
            $table->string('reason', 100);         // view_consumed | click_consumed | plan_reset | admin_add | admin_remove | admin_reset | subscription_expired
            $table->unsignedBigInteger('admin_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('auto_school_id')->references('id')->on('auto_schools')->cascadeOnDelete();
            $table->index(['auto_school_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_logs');
    }
};
