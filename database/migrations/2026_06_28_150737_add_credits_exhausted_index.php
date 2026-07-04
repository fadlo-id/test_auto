<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        try {
            Schema::table('auto_schools', function (Blueprint $table) {
                $table->index(['is_active', 'status', 'credits_exhausted'], 'idx_schools_visible');
            });
        } catch (\Throwable) {}

        try {
            Schema::table('analytics_dedup', function (Blueprint $table) {
                $table->index(['auto_school_id', 'event_date'], 'idx_dedup_school_date');
            });
        } catch (\Throwable) {}

        try {
            Schema::table('credit_logs', function (Blueprint $table) {
                $table->index(['auto_school_id', 'created_at'], 'idx_credit_logs_school_date');
            });
        } catch (\Throwable) {}
    }

    public function down(): void
    {
        try { Schema::table('auto_schools', fn ($t) => $t->dropIndex('idx_schools_visible')); } catch (\Throwable) {}
        try { Schema::table('analytics_dedup', fn ($t) => $t->dropIndex('idx_dedup_school_date')); } catch (\Throwable) {}
        try { Schema::table('credit_logs', fn ($t) => $t->dropIndex('idx_credit_logs_school_date')); } catch (\Throwable) {}
    }
};
