<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_application_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_application_id')->constrained('school_applications')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->timestamps();

            $table->index('school_application_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_application_projects');
    }
};
