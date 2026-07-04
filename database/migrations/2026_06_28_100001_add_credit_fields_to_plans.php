<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->unsignedInteger('monthly_view_credit')->nullable()->after('max_listings')
                ->comment('null = unlimited');
            $table->unsignedInteger('monthly_click_credit')->nullable()->after('monthly_view_credit')
                ->comment('null = unlimited');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['monthly_view_credit', 'monthly_click_credit']);
        });
    }
};
