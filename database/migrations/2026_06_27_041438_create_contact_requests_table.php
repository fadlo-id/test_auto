<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('contact_requests')) {
            Schema::create('contact_requests', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100);
                $table->string('email', 150)->index();
                $table->string('subject', 100);
                $table->text('message');
                $table->string('status', 20)->default('new')->index();
                $table->timestamp('replied_at')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('contact_requests', function (Blueprint $table) {
                if (! Schema::hasColumn('contact_requests', 'status')) {
                    $table->string('status', 20)->default('new')->index();
                }
                if (! Schema::hasColumn('contact_requests', 'replied_at')) {
                    $table->timestamp('replied_at')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_requests');
    }
};
