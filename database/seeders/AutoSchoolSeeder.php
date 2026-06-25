<?php

namespace Database\Seeders;

use App\Models\AutoSchool;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AutoSchoolSeeder extends Seeder
{
    public function run(): void
    {
        // Créer utilisateur propriétaire

        $user = User::updateOrCreate(
            ['email' => 'proprietaire@test.com'],
            [
                'name' => 'Ahmed Propriétaire',
                'phone' => '+212687654321',
                'password' => Hash::make('password123'),
            ]
        );

        // Créer auto-école
        $school = AutoSchool::updateOrCreate(
            ['slug' => 'auto-ecole-casablanca-driving'],
            [
            'user_id' => $user->id,
            'name' => 'Auto-École Casablanca Driving',
            'slug' => 'auto-ecole-casablanca-driving',
            'description' => 'La meilleure auto-école de Casablanca avec instructeurs expérimentés et véhicules modernes.',
            'email' => 'info@autoecole-casa.com',
            'phone' => '+212612111111',
            'address' => '123 Boulevard Mohamed V',
            'city' => 'Casablanca',
            'region' => 'Casablanca-Settat',
            'license_number' => 'AUTOECOLE_CASA_2024_001',
            'established_year' => 2015,
            'website_url' => 'https://autoecole-casa.com',
            'facebook_url' => 'https://facebook.com/autoecole-casa',
            'is_active' => true,
        ]);

        // Attacher catégories
        $school->categories()->syncWithoutDetaching([1, 2]); // A et B

        // Créer services
        $school->services()->firstOrCreate(
            ['name' => 'Formation Code de la Route'],
            [
                'description' => '4 semaines de formation intensive',
                'price' => 500.00,
                'duration_hours' => 40,
            ]
        );

        $school->services()->firstOrCreate(
            ['name' => 'Leçons de Conduite'],
            [
                'description' => 'Conduite pratique avec instructeur certifié',
                'price' => 150.00,
                'duration_hours' => 1,
            ]
        );

        // Créer avis de test
        $school->reviews()->firstOrCreate(
            [
                'user_id' => User::first()->id,
                'title' => 'Excellente auto-école!'
            ],
            [
                'rating' => 5,
                'content' => 'Service professionnel et véhicules modernes. Je recommande vivement!',
                'verified' => true,
            ]
        );
    }
}