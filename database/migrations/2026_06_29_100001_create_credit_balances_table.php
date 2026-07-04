<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->cascadeOnDelete();
            $table->string('credit_type', 20); // view|whatsapp|phone|website|facebook|instagram|maps|email
            $table->integer('balance')->default(0);
            $table->boolean('is_unlimited')->default(false);
            $table->boolean('is_blocked')->default(false);
            $table->timestamps();

            $table->unique(['auto_school_id', 'credit_type']);
            $table->index(['auto_school_id', 'credit_type', 'balance']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_balances');
    }
};
