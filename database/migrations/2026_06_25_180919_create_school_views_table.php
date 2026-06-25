<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_views', function (Blueprint $table) {
            $table->id();

            $table->foreignId('auto_school_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->ipAddress('ip')->nullable();

            $table->string('user_agent')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_views');
    }
};