<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_pipeline_stages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color', 7)->default('#6366f1');
            $table->unsignedSmallInteger('order')->default(0);
            $table->string('type')->default('active'); // active | won | lost
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // Default stages
        DB::table('crm_pipeline_stages')->insert([
            ['name' => 'Nouveau',         'color' => '#94a3b8', 'order' => 1, 'type' => 'active', 'is_default' => true,  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Contacté',        'color' => '#3b82f6', 'order' => 2, 'type' => 'active', 'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Intéressé',       'color' => '#8b5cf6', 'order' => 3, 'type' => 'active', 'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'En négociation',  'color' => '#f59e0b', 'order' => 4, 'type' => 'active', 'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Gagné',           'color' => '#10b981', 'order' => 5, 'type' => 'won',    'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Perdu',           'color' => '#ef4444', 'order' => 6, 'type' => 'lost',   'is_default' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_pipeline_stages');
    }
};
