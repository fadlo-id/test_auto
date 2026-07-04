<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Grandfather in every account that existed before email verification was
     * enforced (User now implements MustVerifyEmail) — without this, any
     * pre-existing account with a null email_verified_at would suddenly be
     * locked out of every `verified`-gated route.
     */
    public function up(): void
    {
        DB::table('users')
            ->whereNull('email_verified_at')
            ->update(['email_verified_at' => now()]);
    }

    /**
     * Intentionally irreversible — un-verifying accounts on rollback would
     * lock real users out, which is worse than leaving them verified.
     */
    public function down(): void
    {
        //
    }
};
