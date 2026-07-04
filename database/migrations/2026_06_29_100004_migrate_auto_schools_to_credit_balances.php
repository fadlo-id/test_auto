<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const CLICK_TYPES = ['whatsapp', 'phone', 'website', 'facebook', 'instagram', 'maps', 'email'];

    public function up(): void
    {
        // Seed credit_balances from existing auto_schools data
        $schools = DB::table('auto_schools')
            ->whereNull('deleted_at')
            ->get(['id', 'views_remaining', 'clicks_remaining']);

        $now = now();
        $rows = [];

        foreach ($schools as $school) {
            $viewBalance   = $school->views_remaining;
            $viewUnlimited = $viewBalance === null;

            $rows[] = [
                'auto_school_id' => $school->id,
                'credit_type'    => 'view',
                'balance'        => $viewBalance ?? 0,
                'is_unlimited'   => $viewUnlimited,
                'is_blocked'     => false,
                'created_at'     => $now,
                'updated_at'     => $now,
            ];

            $clickBalance   = $school->clicks_remaining;
            $clickUnlimited = $clickBalance === null;
            $perType        = $clickUnlimited ? 0 : (int) floor(($clickBalance ?? 0) / count(self::CLICK_TYPES));

            foreach (self::CLICK_TYPES as $type) {
                $rows[] = [
                    'auto_school_id' => $school->id,
                    'credit_type'    => $type,
                    'balance'        => $perType,
                    'is_unlimited'   => $clickUnlimited,
                    'is_blocked'     => false,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ];
            }
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('credit_balances')->insert($chunk);
        }

        // Drop obsolete columns from auto_schools
        Schema::table('auto_schools', function (Blueprint $table) {
            $table->dropColumn(['views_remaining', 'clicks_remaining']);
        });
    }

    public function down(): void
    {
        Schema::table('auto_schools', function (Blueprint $table) {
            $table->integer('views_remaining')->nullable()->default(300);
            $table->integer('clicks_remaining')->nullable()->default(30);
        });

        DB::table('credit_balances')->truncate();
    }
};
