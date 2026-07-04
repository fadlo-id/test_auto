<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_sms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained('crm_prospects')->cascadeOnDelete();
            $table->foreignId('sent_by')->constrained('users');
            $table->string('to_phone', 30);
            $table->text('message');
            $table->string('status', 20)->default('sent'); // sent|failed|pending
            $table->string('provider_id')->nullable(); // Twilio/Vonage message ID
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['prospect_id', 'sent_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_sms');
    }
};
