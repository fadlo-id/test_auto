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
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->timestamp('expiring_soon_notified_at')->nullable()->after('expires_at');
        });

        Schema::table('crm_reminders', function (Blueprint $table) {
            $table->timestamp('notified_at')->nullable()->after('due_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('expiring_soon_notified_at');
        });

        Schema::table('crm_reminders', function (Blueprint $table) {
            $table->dropColumn('notified_at');
        });
    }
};
