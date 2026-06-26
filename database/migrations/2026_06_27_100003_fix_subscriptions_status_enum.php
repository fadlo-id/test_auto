<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL: modify enum to include 'cancelled' (British spelling used in code)
        DB::statement("ALTER TABLE subscriptions MODIFY COLUMN status ENUM('active','past_due','canceled','cancelled') DEFAULT 'active'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE subscriptions MODIFY COLUMN status ENUM('active','past_due','canceled') DEFAULT 'active'");
    }
};
