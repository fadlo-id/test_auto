<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin principal (contrôle absolu)
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@autoecoles.ma'],
            [
                'name'      => 'Super Admin',
                'password'  => Hash::make('Admin@2026!'),
                'phone'     => '+212600000000',
                'role'      => User::ROLE_SUPER_ADMIN,
                'is_active' => true,
            ]
        );
        $superAdmin->markEmailAsVerified();

        // Admin avec permissions limitées (exemple)
        $limitedAdmin = User::updateOrCreate(
            ['email' => 'manager@autoecoles.ma'],
            [
                'name'      => 'Manager Admin',
                'password'  => Hash::make('password'),
                'phone'     => '+212600000010',
                'role'      => User::ROLE_ADMIN,
                'is_active' => true,
            ]
        );
        $limitedAdmin->markEmailAsVerified();
        // Grant limited permissions
        $limitedAdmin->syncPermissions([
            'manage_dashboard', 'manage_schools', 'manage_reviews',
            'manage_contacts', 'manage_analytics',
        ]);

        // Admin with every permission — for exhaustive QA/E2E passes (not a demo account).
        $qaRole = \App\Models\Role::where('name', 'admin')->first();
        if ($qaRole) {
            $qaAdmin = User::updateOrCreate(
                ['email' => 'qa-admin@autoecoles.ma'],
                [
                    'name'      => 'QA Admin',
                    'password'  => Hash::make('QaAdmin@2026!'),
                    'phone'     => '+212600000011',
                    'role'      => User::ROLE_ADMIN,
                    'role_id'   => $qaRole->id,
                    'is_active' => true,
                ]
            );
            $qaAdmin->markEmailAsVerified();
            $qaAdmin->syncPermissions(array_keys(User::ALL_PERMISSIONS));
        }

        // Propriétaire d'auto-école test
        $schoolOwner = User::updateOrCreate(
            ['email' => 'ecole@autoecoles.ma'],
            [
                'name' => 'Auto-École Test',
                'password' => Hash::make('password'),
                'phone' => '+212600000001',
                'role' => User::ROLE_SCHOOL_OWNER,
                'is_active' => true,
            ]
        );
        $schoolOwner->markEmailAsVerified();

        // Utilisateur normal test
        $user = User::updateOrCreate(
            ['email' => 'user@autoecoles.ma'],
            [
                'name' => 'Utilisateur Test',
                'password' => Hash::make('password'),
                'phone' => '+212600000002',
                'role' => User::ROLE_USER,
                'is_active' => true,
            ]
        );
        $user->markEmailAsVerified();

        $this->command->info('Utilisateurs créés avec succès !');
        $this->command->info('Super Admin : admin@autoecoles.ma / Admin@2026!');
        $this->command->info('Admin limité : manager@autoecoles.ma / password');
        $this->command->info('École : ecole@autoecoles.ma / password');
        $this->command->info('User : user@autoecoles.ma / password');
    }
}
