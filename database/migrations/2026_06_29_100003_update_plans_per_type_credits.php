<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('view_credits')->nullable()->after('monthly_click_credit');
            $table->integer('whatsapp_credits')->nullable()->after('view_credits');
            $table->integer('phone_credits')->nullable()->after('whatsapp_credits');
            $table->integer('website_credits')->nullable()->after('phone_credits');
            $table->integer('facebook_credits')->nullable()->after('website_credits');
            $table->integer('instagram_credits')->nullable()->after('facebook_credits');
            $table->integer('maps_credits')->nullable()->after('instagram_credits');
            $table->integer('email_credits')->nullable()->after('maps_credits');
        });

        // Migrate existing data: distribute monthly_click_credit evenly across 7 click types
        $clickTypes = ['whatsapp_credits', 'phone_credits', 'website_credits', 'facebook_credits', 'instagram_credits', 'maps_credits', 'email_credits'];

        DB::table('plans')->get(['id', 'monthly_view_credit', 'monthly_click_credit'])->each(function ($plan) use ($clickTypes) {
            $clickVal   = $plan->monthly_click_credit;
            $perType    = $clickVal === null ? null : max(5, (int) floor($clickVal / 7));
            $updates    = ['view_credits' => $plan->monthly_view_credit];
            foreach ($clickTypes as $col) {
                $updates[$col] = $perType;
            }
            DB::table('plans')->where('id', $plan->id)->update($updates);
        });

        // Drop indexes that may reference non-existent columns (SQLite column-drop restriction)
        foreach ([
            ['analytics_dedup',  'idx_dedup_school_date'],
            ['contact_requests', 'idx_contacts_school_date'],
            ['credit_logs',      'idx_credit_logs_school_date'],
        ] as [$tbl, $idx]) {
            try {
                Schema::table($tbl, fn ($t) => $t->dropIndex($idx));
            } catch (\Throwable) {}
        }

        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['monthly_view_credit', 'monthly_click_credit']);
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('monthly_view_credit')->nullable();
            $table->integer('monthly_click_credit')->nullable();
            $table->dropColumn([
                'view_credits', 'whatsapp_credits', 'phone_credits', 'website_credits',
                'facebook_credits', 'instagram_credits', 'maps_credits', 'email_credits',
            ]);
        });
    }
};
