<?php

namespace Database\Factories;

use App\Models\AutoSchool;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'auto_school_id' => AutoSchool::factory(),
            'name'           => fake()->randomElement(['Permis B', 'Permis A', 'Code de la route', 'Conduite accompagnee']),
            'description'    => fake()->sentence(),
            'price'          => fake()->numberBetween(1500, 5000),
            'duration_hours' => fake()->numberBetween(10, 50),
            'is_active'      => true,
        ];
    }
}
