<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreign('subscription_id')->references('id')->on('subscriptions')->nullOnDelete();
            $table->foreign('coupon_id')->references('id')->on('coupons')->nullOnDelete();
        });

        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            $table->index('status');
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['subscription_id']);
            $table->dropForeign(['coupon_id']);
        });

        Schema::table('newsletter_subscribers', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->dropIndex(['expires_at']);
        });
    }
};
