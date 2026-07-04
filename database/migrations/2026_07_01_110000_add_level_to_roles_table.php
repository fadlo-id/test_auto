<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            // Hierarchy rank: 1 = most senior (Super Admin) ... 7 = least senior (User).
            // Nullable so custom/non-hierarchical roles created later aren't forced into the ladder.
            $table->unsignedTinyInteger('level')->nullable()->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('level');
        });
    }
};
