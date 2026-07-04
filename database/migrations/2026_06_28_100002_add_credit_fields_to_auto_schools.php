<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auto_schools', function (Blueprint $table) {
            $table->integer('views_remaining')->nullable()->after('rejection_reason')
                ->comment('null = unlimited; default 300 for free tier');
            $table->integer('clicks_remaining')->nullable()->after('views_remaining')
                ->comment('null = unlimited; default 30 for free tier');
            $table->boolean('credits_exhausted')->default(false)->after('clicks_remaining');
            $table->timestamp('credits_reset_at')->nullable()->after('credits_exhausted');
        });

        // Set free-tier defaults for existing approved schools
        \DB::table('auto_schools')
            ->whereNull('views_remaining')
            ->update(['views_remaining' => 300, 'clicks_remaining' => 30]);
    }

    public function down(): void
    {
        Schema::table('auto_schools', function (Blueprint $table) {
            $table->dropColumn([
                'views_remaining', 'clicks_remaining',
                'credits_exhausted', 'credits_reset_at',
            ]);
        });
    }
};
