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
                $table->index(['is_active', 'status'], 'idx_schools_active_status');
                $table->index(['is_active', 'status', 'city'], 'idx_schools_active_city');
                $table->index(['is_active', 'status', 'featured_until'], 'idx_schools_featured');
            });
        } catch (\Throwable) {}

        try {
            Schema::table('reviews', function (Blueprint $table) {
                $table->index(['auto_school_id', 'status'], 'idx_reviews_school_status');
                $table->index(['user_id', 'auto_school_id'], 'idx_reviews_user_school');
            });
        } catch (\Throwable) {}

        try {
            Schema::table('subscriptions', function (Blueprint $table) {
                $table->index(['auto_school_id', 'status'], 'idx_subs_school_status');
                $table->index(['status', 'expires_at'], 'idx_subs_status_expires');
            });
        } catch (\Throwable) {}

        try {
            Schema::table('payments', function (Blueprint $table) {
                $table->index(['auto_school_id', 'status'], 'idx_payments_school_status');
                $table->index(['status', 'created_at'], 'idx_payments_status_date');
            });
        } catch (\Throwable) {}
    }

    public function down(): void
    {
        try { Schema::table('auto_schools', fn ($t) => $t->dropIndex('idx_schools_active_status')); } catch (\Throwable) {}
        try { Schema::table('auto_schools', fn ($t) => $t->dropIndex('idx_schools_active_city')); } catch (\Throwable) {}
        try { Schema::table('auto_schools', fn ($t) => $t->dropIndex('idx_schools_featured')); } catch (\Throwable) {}
        try { Schema::table('reviews', fn ($t) => $t->dropIndex('idx_reviews_school_status')); } catch (\Throwable) {}
        try { Schema::table('reviews', fn ($t) => $t->dropIndex('idx_reviews_user_school')); } catch (\Throwable) {}
        try { Schema::table('subscriptions', fn ($t) => $t->dropIndex('idx_subs_school_status')); } catch (\Throwable) {}
        try { Schema::table('subscriptions', fn ($t) => $t->dropIndex('idx_subs_status_expires')); } catch (\Throwable) {}
        try { Schema::table('payments', fn ($t) => $t->dropIndex('idx_payments_school_status')); } catch (\Throwable) {}
        try { Schema::table('payments', fn ($t) => $t->dropIndex('idx_payments_status_date')); } catch (\Throwable) {}
    }
};
