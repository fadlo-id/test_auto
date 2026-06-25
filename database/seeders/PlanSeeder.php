<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::updateOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'Free',
                'price' => 0,
                'currency' => 'DH',
                'billing_period' => 'monthly',
                'features' => [
                    'listing' => true,
                    'reviews' => true,
                    'analytics' => false,
                    'featured' => false,
                    'support' => false,
                    'max_monthly' => 50
                ],
                'max_listings' => 1,
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter',
                'price' => 99,
                'currency' => 'DH',
                'billing_period' => 'monthly',
                'features' => [
                    'listing' => true,
                    'reviews' => true,
                    'featured' => true,
                    'analytics' => true,
                    'support' => false,
                    'max_monthly' => 200
                ],
                'max_listings' => 1,
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'professional'],
            [
                'name' => 'Professional',
                'price' => 299,
                'currency' => 'DH',
                'billing_period' => 'monthly',
                'features' => [
                    'listing' => true,
                    'reviews' => true,
                    'featured' => true,
                    'analytics' => true,
                    'support' => true,
                    'unlimited' => true
                ],
                'max_listings' => 999999,
            ]
        );
    }
}