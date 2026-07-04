<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained('crm_prospects')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->text('content');
            $table->string('type', 20)->default('general'); // general|call|meeting|email|sms
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();

            $table->index(['prospect_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_notes');
    }
};
