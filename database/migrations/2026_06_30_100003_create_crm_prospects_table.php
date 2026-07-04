<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_prospects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('company', 150)->nullable();
            $table->string('source', 50)->default('direct'); // website|referral|social|direct|event|other
            $table->foreignId('stage_id')->nullable()->constrained('crm_pipeline_stages')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('active'); // active|won|lost|archived
            $table->integer('score')->default(0); // lead scoring 0-100
            $table->text('description')->nullable();
            $table->timestamp('last_contact_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'stage_id']);
            $table->index('assigned_to');
            $table->index('last_contact_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_prospects');
    }
};
