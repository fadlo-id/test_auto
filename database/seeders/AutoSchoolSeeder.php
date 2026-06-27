<?php

namespace Database\Seeders;

use App\Models\AutoSchool;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AutoSchoolSeeder extends Seeder
{
    public function run(): void
    {
        // Reuse school_owner already created by AdminSeeder
        $owner = User::where('email', 'ecole@autoecoles.ma')->first()
            ?? User::updateOrCreate(
                ['email' => 'ecole@autoecoles.ma'],
                [
                    'name'              => 'Auto-École Test',
                    'phone'             => '+212600000001',
                    'password'          => Hash::make('password'),
                    'role'              => User::ROLE_SCHOOL_OWNER,
                    'is_active'         => true,
                    'email_verified_at' => now(),
                ]
            );

        // Demo school — approved so it appears in public search
        $school = AutoSchool::updateOrCreate(
            ['slug' => 'auto-ecole-casablanca-driving'],
            [
                'user_id'          => $owner->id,
                'name'             => 'Auto-École Casablanca Driving',
                'slug'             => 'auto-ecole-casablanca-driving',
                'description'      => 'La meilleure auto-école de Casablanca avec instructeurs expérimentés et véhicules modernes.',
                'email'            => 'info@autoecole-casa.com',
                'phone'            => '+212612111111',
                'address'          => '123 Boulevard Mohamed V',
                'city'             => 'Casablanca',
                'region'           => 'Casablanca-Settat',
                'latitude'         => 33.5731,
                'longitude'        => -7.5898,
                'license_number'   => 'AUTOECOLE_CASA_2024_001',
                'established_year' => 2015,
                'website_url'      => 'https://autoecole-casa.com',
                'facebook_url'     => 'https://facebook.com/autoecole-casa',
                'is_active'        => true,
                'status'           => 'approved',
                'verified_at'      => now(),
            ]
        );

        $school->categories()->syncWithoutDetaching([1, 2]);

        $school->services()->firstOrCreate(
            ['name' => 'Formation Code de la Route'],
            [
                'description' => '4 semaines de formation intensive',
                'price'       => 500.00,
                'duration'    => 40,
                'is_active'   => true,
            ]
        );

        $school->services()->firstOrCreate(
            ['name' => 'Leçons de Conduite'],
            [
                'description' => 'Conduite pratique avec instructeur certifié',
                'price'       => 150.00,
                'duration'    => 1,
                'is_active'   => true,
            ]
        );

        // Demo review from regular user
        $reviewer = User::where('email', 'user@autoecoles.ma')->first();
        if ($reviewer) {
            $school->reviews()->firstOrCreate(
                ['user_id' => $reviewer->id, 'title' => 'Excellente auto-école!'],
                [
                    'rating'  => 5,
                    'content' => 'Service professionnel et véhicules modernes. Je recommande vivement!',
                    'status'  => 'approved',
                ]
            );
        }

        $this->command->info('Demo school created — ecole@autoecoles.ma / password');
    }
}
