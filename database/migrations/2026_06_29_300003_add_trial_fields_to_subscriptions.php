<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->timestamp('trial_ends_at')->nullable()->after('expires_at');
            $table->boolean('on_trial')->default(false)->after('trial_ends_at');
            $table->unsignedTinyInteger('payment_retry_count')->default(0)->after('on_trial');
            $table->timestamp('next_payment_retry_at')->nullable()->after('payment_retry_count');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn(['trial_ends_at', 'on_trial', 'payment_retry_count', 'next_payment_retry_at']);
        });
    }
};
