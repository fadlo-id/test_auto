<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auto_schools', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('rejection_reason');
            $table->index('stripe_customer_id', 'idx_schools_stripe_customer');
        });
    }

    public function down(): void
    {
        Schema::table('auto_schools', function (Blueprint $table) {
            $table->dropIndex('idx_schools_stripe_customer');
            $table->dropColumn('stripe_customer_id');
        });
    }
};
