<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 20)->unique();
            $table->string('capital', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed Morocco's 12 official regions
        DB::table('regions')->insert([
            ['name' => 'Tanger-Tétouan-Al Hoceïma',     'code' => 'TTA', 'capital' => 'Tanger',       'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Oriental',                         'code' => 'ORI', 'capital' => 'Oujda',        'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Fès-Meknès',                       'code' => 'FME', 'capital' => 'Fès',          'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Rabat-Salé-Kénitra',               'code' => 'RSK', 'capital' => 'Rabat',        'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Béni Mellal-Khénifra',             'code' => 'BMK', 'capital' => 'Béni Mellal',  'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Casablanca-Settat',                'code' => 'CAS', 'capital' => 'Casablanca',   'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Marrakech-Safi',                   'code' => 'MAR', 'capital' => 'Marrakech',    'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Drâa-Tafilalet',                   'code' => 'DRT', 'capital' => 'Errachidia',   'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Souss-Massa',                      'code' => 'SOM', 'capital' => 'Agadir',       'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Guelmim-Oued Noun',                'code' => 'GON', 'capital' => 'Guelmim',      'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Laâyoune-Sakia El Hamra',          'code' => 'LSH', 'capital' => 'Laâyoune',     'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Dakhla-Oued Ed-Dahab',             'code' => 'DOD', 'capital' => 'Dakhla',       'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('regions');
    }
};
