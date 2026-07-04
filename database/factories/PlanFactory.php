<?php

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        $name = $this->faker->words(2, true);
        return [
            'name'             => ucfirst($name),
            'slug'             => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'description'      => $this->faker->sentence(),
            'price'            => $this->faker->randomElement([99, 199, 299, 499]),
            'currency'         => 'MAD',
            'billing_period'   => $this->faker->randomElement(['monthly', 'yearly']),
            'stripe_price_id'  => null,
            'features'         => ['listing' => true, 'reviews' => true, 'analytics' => false, 'featured' => false, 'support' => false],
            'max_listings'     => 1,
            'is_active'        => true,
            'view_credits'     => 3000,
            'whatsapp_credits' => 300,
            'phone_credits'    => 300,
            'website_credits'  => 100,
            'facebook_credits' => 100,
            'instagram_credits'=> 100,
            'maps_credits'     => 200,
            'email_credits'    => 100,
        ];
    }

    public function unlimited(): static
    {
        return $this->state(fn () => [
            'view_credits'     => null,
            'whatsapp_credits' => null,
            'phone_credits'    => null,
            'website_credits'  => null,
            'facebook_credits' => null,
            'instagram_credits'=> null,
            'maps_credits'     => null,
            'email_credits'    => null,
        ]);
    }
}
