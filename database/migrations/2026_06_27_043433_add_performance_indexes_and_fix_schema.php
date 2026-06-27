<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Composite index for the most common active school query
        Schema::table('auto_schools', function (Blueprint $table) {
            if (! $this->indexExists('auto_schools', 'auto_schools_is_active_status_deleted_at_index')) {
                $table->index(['is_active', 'status', 'deleted_at'], 'auto_schools_is_active_status_deleted_at_index');
            }
            if (! $this->indexExists('auto_schools', 'auto_schools_status_index')) {
                $table->index('status', 'auto_schools_status_index');
            }
        });

        // Reviews: filter by status is a very common operation
        Schema::table('reviews', function (Blueprint $table) {
            if (! $this->indexExists('reviews', 'reviews_auto_school_id_status_index')) {
                $table->index(['auto_school_id', 'status'], 'reviews_auto_school_id_status_index');
            }
            if (! $this->indexExists('reviews', 'reviews_user_id_status_index')) {
                $table->index(['user_id', 'status'], 'reviews_user_id_status_index');
            }
        });

        // Payments
        Schema::table('payments', function (Blueprint $table) {
            if (! $this->indexExists('payments', 'payments_status_index')) {
                $table->index('status', 'payments_status_index');
            }
            if (! $this->indexExists('payments', 'payments_auto_school_id_status_index')) {
                $table->index(['auto_school_id', 'status'], 'payments_auto_school_id_status_index');
            }
        });

        // Subscriptions: fix status enum to include 'cancelled' and 'expired'
        \DB::statement("ALTER TABLE subscriptions MODIFY COLUMN status ENUM('active','past_due','canceled','cancelled','expired') NOT NULL DEFAULT 'active'");

        // Subscriptions index
        Schema::table('subscriptions', function (Blueprint $table) {
            if (! $this->indexExists('subscriptions', 'subscriptions_auto_school_id_status_index')) {
                $table->index(['auto_school_id', 'status'], 'subscriptions_auto_school_id_status_index');
            }
        });

        // Users
        Schema::table('users', function (Blueprint $table) {
            if (! $this->indexExists('users', 'users_role_is_active_index')) {
                $table->index(['role', 'is_active'], 'users_role_is_active_index');
            }
        });
    }

    public function down(): void
    {
        Schema::table('auto_schools', function (Blueprint $table) {
            $table->dropIndex('auto_schools_is_active_status_deleted_at_index');
            $table->dropIndex('auto_schools_status_index');
        });
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('reviews_auto_school_id_status_index');
            $table->dropIndex('reviews_user_id_status_index');
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_status_index');
            $table->dropIndex('payments_auto_school_id_status_index');
        });
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex('subscriptions_auto_school_id_status_index');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_is_active_index');
        });
    }

    private function indexExists(string $table, string $name): bool
    {
        $indexes = \DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$name]);
        return ! empty($indexes);
    }
};
