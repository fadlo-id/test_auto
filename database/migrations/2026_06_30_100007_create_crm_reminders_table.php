<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained('crm_prospects')->cascadeOnDelete();
            $table->foreignId('assigned_to')->constrained('users');
            $table->foreignId('created_by')->constrained('users');
            $table->string('title');
            $table->text('note')->nullable();
            $table->timestamp('due_at');
            $table->string('status', 20)->default('pending'); // pending|done|cancelled
            $table->timestamp('done_at')->nullable();
            $table->timestamps();

            $table->index(['assigned_to', 'status', 'due_at']);
            $table->index(['prospect_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_reminders');
    }
};
