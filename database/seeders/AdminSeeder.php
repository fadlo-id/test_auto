<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Admin principal
        User::updateOrCreate(
            ['email' => 'admin@autoecoles.ma'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Admin@2026!'),
                'phone' => '+212600000000',
                'role' => User::ROLE_ADMIN,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Propriétaire d'auto-école test
        User::updateOrCreate(
            ['email' => 'ecole@autoecoles.ma'],
            [
                'name' => 'Auto-École Test',
                'password' => Hash::make('password'),
                'phone' => '+212600000001',
                'role' => User::ROLE_SCHOOL_OWNER,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Utilisateur normal test
        User::updateOrCreate(
            ['email' => 'user@autoecoles.ma'],
            [
                'name' => 'Utilisateur Test',
                'password' => Hash::make('password'),
                'phone' => '+212600000002',
                'role' => User::ROLE_USER,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Utilisateurs créés avec succès !');
        $this->command->info('Admin: admin@autoecoles.ma / Admin@2026!');
        $this->command->info('École: ecole@autoecoles.ma / password');
        $this->command->info('User: user@autoecoles.ma / password');
    }
}