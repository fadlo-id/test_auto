<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // bookings had no indexes at all — critical for admin dashboard queries
        try {
            Schema::table('bookings', function (Blueprint $table) {
                $table->index(['auto_school_id', 'status'], 'idx_bookings_school_status');
                $table->index(['auto_school_id', 'created_at'], 'idx_bookings_school_date');
            });
        } catch (\Throwable) {}

        // view_events: the TrackingService dedup query filters on school+ip+date
        // Adding ip_address to the composite index avoids a full scan per school
        try {
            Schema::table('view_events', function (Blueprint $table) {
                $table->index(['auto_school_id', 'ip_address', 'created_at'], 'idx_views_school_ip_date');
            });
        } catch (\Throwable) {}

        // contact_requests: queried by school in admin views
        try {
            Schema::table('contact_requests', function (Blueprint $table) {
                $table->index(['auto_school_id', 'created_at'], 'idx_contacts_school_date');
            });
        } catch (\Throwable) {}
    }

    public function down(): void
    {
        try { Schema::table('bookings', fn ($t) => $t->dropIndex('idx_bookings_school_status')); } catch (\Throwable) {}
        try { Schema::table('bookings', fn ($t) => $t->dropIndex('idx_bookings_school_date')); } catch (\Throwable) {}
        try { Schema::table('view_events', fn ($t) => $t->dropIndex('idx_views_school_ip_date')); } catch (\Throwable) {}
        try { Schema::table('contact_requests', fn ($t) => $t->dropIndex('idx_contacts_school_date')); } catch (\Throwable) {}
    }
};
