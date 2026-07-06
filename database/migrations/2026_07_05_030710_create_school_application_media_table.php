<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_application_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_application_id')->constrained('school_applications')->cascadeOnDelete();
            $table->string('type', 20); // logo|gallery
            $table->string('path');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['school_application_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_application_media');
    }
};
