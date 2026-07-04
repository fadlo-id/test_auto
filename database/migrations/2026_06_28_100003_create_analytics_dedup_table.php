<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_dedup', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('auto_school_id');
            $table->string('visitor_hash', 64);
            $table->string('event_type', 50);   // view | phone | whatsapp | website | facebook | instagram | email | maps
            $table->date('tracked_date');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('auto_school_id')->references('id')->on('auto_schools')->cascadeOnDelete();
            $table->unique(['auto_school_id', 'visitor_hash', 'event_type', 'tracked_date'], 'dedup_unique');
            $table->index(['auto_school_id', 'tracked_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_dedup');
    }
};
