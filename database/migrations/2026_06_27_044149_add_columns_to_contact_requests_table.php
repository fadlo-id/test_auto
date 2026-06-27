<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            if (! Schema::hasColumn('contact_requests', 'name')) {
                $table->string('name', 100)->after('id');
            }
            if (! Schema::hasColumn('contact_requests', 'email')) {
                $table->string('email', 150)->after('name')->index();
            }
            if (! Schema::hasColumn('contact_requests', 'subject')) {
                $table->string('subject', 100)->after('email');
            }
            if (! Schema::hasColumn('contact_requests', 'message')) {
                $table->text('message')->after('subject');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contact_requests', function (Blueprint $table) {
            $table->dropColumn(['name', 'email', 'subject', 'message']);
        });
    }
};
