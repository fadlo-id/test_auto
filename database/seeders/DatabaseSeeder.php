<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            AdminSeeder::class,
            CategorySeeder::class,
            PlanSeeder::class,
            AutoSchoolSeeder::class,
        ]);
    }
}