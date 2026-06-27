<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // auto_schools: composite index for active school listing
        Schema::table('auto_schools', function (Blueprint $table) {
            $table->index(['is_active', 'status'], 'idx_schools_active_status');
            $table->index(['is_active', 'status', 'city'], 'idx_schools_active_city');
            $table->index(['is_active', 'status', 'featured_until'], 'idx_schools_featured');
            $table->index('slug');
        });

        // reviews: composite indexes for filtering and counting
        Schema::table('reviews', function (Blueprint $table) {
            $table->index(['auto_school_id', 'status'], 'idx_reviews_school_status');
            $table->index(['user_id', 'auto_school_id'], 'idx_reviews_user_school');
        });

        // subscriptions: active lookup
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->index(['auto_school_id', 'status'], 'idx_subs_school_status');
            $table->index(['status', 'expires_at'], 'idx_subs_status_expires');
        });

        // payments: revenue aggregation
        Schema::table('payments', function (Blueprint $table) {
            $table->index(['auto_school_id', 'status'], 'idx_payments_school_status');
            $table->index(['status', 'created_at'], 'idx_payments_status_date');
        });
    }

    public function down(): void
    {
        Schema::table('auto_schools', function (Blueprint $table) {
            $table->dropIndex('idx_schools_active_status');
            $table->dropIndex('idx_schools_active_city');
            $table->dropIndex('idx_schools_featured');
            $table->dropIndex('idx_schools_slug');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_reviews_school_status');
            $table->dropIndex('idx_reviews_user_school');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex('idx_subs_school_status');
            $table->dropIndex('idx_subs_status_expires');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_school_status');
            $table->dropIndex('idx_payments_status_date');
        });
    }
};
