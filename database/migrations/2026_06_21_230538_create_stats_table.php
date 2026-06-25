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
        Schema::create('stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_school_id')->constrained()->onDelete('cascade');
            $table->integer('views_count')->default(0);
            $table->integer('clicks_count')->default(0);
            $table->integer('registrations_count')->default(0);
            $table->date('date');
            $table->timestamps();
            
            $table->unique(['auto_school_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stats');
    }
};
