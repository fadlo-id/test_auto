<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    // The original migration uses enum(['pending','completed','failed','refunded'])
    // but the entire codebase (PaymentService, StripeWebhookController, DashboardController)
    // writes/reads 'success'. This migration corrects the constraint.

    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            $this->rebuildSqlite();
        } else {
            Schema::table('payments', function (Blueprint $table) {
                $table->enum('status', ['pending', 'success', 'completed', 'failed', 'refunded', 'cancelled'])
                      ->default('pending')
                      ->change();
            });
        }
    }

    public function down(): void {}

    private function rebuildSqlite(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF');

        // Rebuild payments table with fixed CHECK constraint
        DB::statement('ALTER TABLE payments RENAME TO _payments_old');

        DB::statement(<<<'SQL'
            CREATE TABLE "payments" (
                "id"                        integer not null primary key autoincrement,
                "auto_school_id"            integer not null,
                "plan_id"                   integer null,
                "subscription_id"           integer null,
                "coupon_id"                 integer null,
                "coupon_code"               varchar(50) null,
                "amount"                    numeric(10,2) not null,
                "discount_amount"           numeric(10,2) null,
                "currency"                  varchar not null default 'DH',
                "status"                    text not null default 'pending'
                                            check ("status" in ('pending','success','completed','failed','refunded','cancelled')),
                "stripe_payment_intent_id"  varchar null,
                "paid_at"                   datetime null,
                "description"               text null,
                "created_at"                datetime null,
                "updated_at"               datetime null,
                foreign key ("auto_school_id") references "auto_schools" ("id") on delete cascade,
                foreign key ("plan_id") references "plans" ("id") on delete set null
            )
        SQL);

        DB::statement(<<<'SQL'
            INSERT INTO "payments"
                (id, auto_school_id, plan_id, subscription_id, coupon_id, coupon_code,
                 amount, discount_amount, currency, status, stripe_payment_intent_id,
                 paid_at, description, created_at, updated_at)
            SELECT
                id, auto_school_id, plan_id, subscription_id, coupon_id, coupon_code,
                amount, discount_amount, currency, status, stripe_payment_intent_id,
                paid_at, description, created_at, updated_at
            FROM _payments_old
        SQL);

        DB::statement('DROP TABLE _payments_old');
        DB::statement('PRAGMA foreign_keys = ON');
    }
};
