<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE services CHANGE duration_hours duration INT(11) NULL DEFAULT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE services CHANGE duration duration_hours INT(11) NULL DEFAULT NULL');
    }
};
