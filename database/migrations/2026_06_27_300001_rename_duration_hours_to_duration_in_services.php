<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            if (Schema::hasColumn('services', 'duration_hours')) {
                Schema::table('services', fn (Blueprint $t) => $t->renameColumn('duration_hours', 'duration'));
            }
        } else {
            DB::statement('ALTER TABLE services CHANGE duration_hours duration INT(11) NULL DEFAULT NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            if (Schema::hasColumn('services', 'duration')) {
                Schema::table('services', fn (Blueprint $t) => $t->renameColumn('duration', 'duration_hours'));
            }
        } else {
            DB::statement('ALTER TABLE services CHANGE duration duration_hours INT(11) NULL DEFAULT NULL');
        }
    }
};
