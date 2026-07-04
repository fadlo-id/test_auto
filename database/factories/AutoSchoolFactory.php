<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AutoSchoolFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->company() . ' Auto-Ecole';
        return [
            'user_id'           => User::factory()->state(['role' => 'school_owner']),
            'name'              => $name,
            'slug'              => Str::slug($name) . '-' . fake()->unique()->numerify('###'),
            'email'             => fake()->companyEmail(),
            'phone'             => '06' . fake()->numerify('########'),
            'address'           => fake()->streetAddress(),
            'city'              => fake()->randomElement(['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tanger']),
            'region'            => fake()->randomElement(['Grand Casablanca', 'Rabat-Sale', 'Marrakech-Safi']),
            'description'       => fake()->paragraph(),
            'license_number'    => fake()->unique()->numerify('AE-######'),
            'status'            => 'pending',
            'is_active'         => false,
            'latitude'          => fake()->latitude(27, 36),
            'longitude'         => fake()->longitude(-14, -1),
            'credits_exhausted' => false,
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status'     => 'approved',
            'is_active'  => true,
            'verified_at'=> now(),
        ]);
    }
}
