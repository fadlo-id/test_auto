<?php

namespace Database\Factories;

use App\Models\AutoSchool;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'auto_school_id' => AutoSchool::factory(),
            'user_id'        => User::factory(),
            'rating'         => fake()->numberBetween(1, 5),
            'title'          => fake()->optional()->sentence(4),
            'content'        => fake()->paragraph(),
            'status'         => 'pending',
            'owner_reply'    => null,
            'replied_at'     => null,
        ];
    }
}
