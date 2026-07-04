<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Composite index for the most common active school query
        try {
            Schema::table('auto_schools', function (Blueprint $table) {
                if (! $this->indexExists('auto_schools', 'auto_schools_is_active_status_deleted_at_index')) {
                    $table->index(['is_active', 'status', 'deleted_at'], 'auto_schools_is_active_status_deleted_at_index');
                }
                if (! $this->indexExists('auto_schools', 'auto_schools_status_index')) {
                    $table->index('status', 'auto_schools_status_index');
                }
            });
        } catch (\Throwable) {}

        // Reviews
        try {
            Schema::table('reviews', function (Blueprint $table) {
                if (! $this->indexExists('reviews', 'reviews_auto_school_id_status_index')) {
                    $table->index(['auto_school_id', 'status'], 'reviews_auto_school_id_status_index');
                }
                if (! $this->indexExists('reviews', 'reviews_user_id_status_index')) {
                    $table->index(['user_id', 'status'], 'reviews_user_id_status_index');
                }
            });
        } catch (\Throwable) {}

        // Payments
        try {
            Schema::table('payments', function (Blueprint $table) {
                if (! $this->indexExists('payments', 'payments_status_index')) {
                    $table->index('status', 'payments_status_index');
                }
                if (! $this->indexExists('payments', 'payments_auto_school_id_status_index')) {
                    $table->index(['auto_school_id', 'status'], 'payments_auto_school_id_status_index');
                }
            });
        } catch (\Throwable) {}

        // Subscriptions: fix status enum to include 'cancelled' and 'expired' (MySQL only)
        if (\DB::getDriverName() === 'mysql') {
            \DB::statement("ALTER TABLE subscriptions MODIFY COLUMN status ENUM('active','past_due','canceled','cancelled','expired') NOT NULL DEFAULT 'active'");
        }

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
        try { Schema::table('auto_schools', fn ($t) => $t->dropIndex('auto_schools_is_active_status_deleted_at_index')); } catch (\Throwable) {}
        try { Schema::table('auto_schools', fn ($t) => $t->dropIndex('auto_schools_status_index')); } catch (\Throwable) {}
        try { Schema::table('reviews', fn ($t) => $t->dropIndex('reviews_auto_school_id_status_index')); } catch (\Throwable) {}
        try { Schema::table('reviews', fn ($t) => $t->dropIndex('reviews_user_id_status_index')); } catch (\Throwable) {}
        try { Schema::table('payments', fn ($t) => $t->dropIndex('payments_status_index')); } catch (\Throwable) {}
        try { Schema::table('payments', fn ($t) => $t->dropIndex('payments_auto_school_id_status_index')); } catch (\Throwable) {}
        try { Schema::table('subscriptions', fn ($t) => $t->dropIndex('subscriptions_auto_school_id_status_index')); } catch (\Throwable) {}
        try { Schema::table('users', fn ($t) => $t->dropIndex('users_role_is_active_index')); } catch (\Throwable) {}
    }

    private function indexExists(string $table, string $name): bool
    {
        if (\DB::getDriverName() === 'sqlite') {
            $indexes = \DB::select("PRAGMA index_list(`{$table}`)");
            return collect($indexes)->contains('name', $name);
        }
        $indexes = \DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$name]);
        return ! empty($indexes);
    }
};
