<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['code' => 'A',  'name_fr' => 'Motocyclette',   'name_ar' => 'دراجة نارية',          'name_en' => 'Motorcycle'],
            ['code' => 'B',  'name_fr' => 'Voiture',        'name_ar' => 'سيارة',                 'name_en' => 'Car'],
            ['code' => 'C',  'name_fr' => 'Camion',         'name_ar' => 'شاحنة',                 'name_en' => 'Truck'],
            ['code' => 'AM', 'name_fr' => 'Cyclomoteur',   'name_ar' => 'دراجة',                 'name_en' => 'Moped'],
            ['code' => 'A1', 'name_fr' => 'Moto légère',   'name_ar' => 'دراجة نارية خفيفة',    'name_en' => 'Light Motorcycle'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['code' => $category['code']],
                $category
            );
        }
    }
}