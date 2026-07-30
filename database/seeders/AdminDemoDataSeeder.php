<?php

namespace Database\Seeders;

use App\Models\AutoSchool;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Keeps the Admin panel non-empty for demos/QA: a handful of named auto-schools,
 * a user of each real role tier, and a few example notifications. Safe to re-run
 * (updateOrCreate / existence checks throughout) — never duplicates on reseed.
 *
 * Note: this app's data model only has 4 account roles (super_admin, admin,
 * school_owner, user) plus a fine-grained admin hierarchy (support, moderator,
 * staff — see Role::HIERARCHY). There is no distinct "instructor" role, so
 * that persona is represented via extra school_owner/user demo accounts instead
 * of inventing a role the schema doesn't have.
 */
class AdminDemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSchools();
        $this->seedRoleDiversityUsers();
        $this->seedExampleNotifications();

        $this->command->info('Admin demo data ready: 4 auto-écoles, role-diverse users, example notifications.');
    }

    private function logoUrl(string $name): string
    {
        return 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=ea580c&color=fff&bold=true&size=128';
    }

    private function seedSchools(): void
    {
        $schools = [
            [
                'name' => 'Auto-École Atlas', 'city' => 'Marrakech', 'status' => 'approved',
                'owner_name' => 'Youssef Atlas', 'owner_email' => 'atlas@autoecole-demo.ma',
                'phone' => '+212524000001', 'email' => 'contact@autoecole-atlas.ma',
            ],
            [
                'name' => 'Auto-École Al Amal', 'city' => 'Rabat', 'status' => 'approved',
                'owner_name' => 'Amal Bennani', 'owner_email' => 'alamal@autoecole-demo.ma',
                'phone' => '+212537000002', 'email' => 'contact@autoecole-alamal.ma',
            ],
            [
                'name' => 'Auto-École Salam', 'city' => 'Tanger', 'status' => 'pending',
                'owner_name' => 'Karim Salam', 'owner_email' => 'salam@autoecole-demo.ma',
                'phone' => '+212539000003', 'email' => 'contact@autoecole-salam.ma',
            ],
            [
                'name' => 'Auto-École Horizon', 'city' => 'Agadir', 'status' => 'rejected',
                'owner_name' => 'Nadia Horizon', 'owner_email' => 'horizon@autoecole-demo.ma',
                'phone' => '+212528000004', 'email' => 'contact@autoecole-horizon.ma',
                'rejection_reason' => 'Documents incomplets — licence en attente de renouvellement.',
            ],
        ];

        foreach ($schools as $s) {
            $owner = User::updateOrCreate(
                ['email' => $s['owner_email']],
                [
                    'name'      => $s['owner_name'],
                    'password'  => Hash::make('password'),
                    'phone'     => $s['phone'],
                    'role'      => User::ROLE_SCHOOL_OWNER,
                    'is_active' => true,
                ]
            );
            $owner->markEmailAsVerified();

            $slug = Str::slug($s['name']);

            AutoSchool::updateOrCreate(
                ['slug' => $slug],
                [
                    'user_id'          => $owner->id,
                    'name'             => $s['name'],
                    'slug'             => $slug,
                    'description'      => "{$s['name']} — auto-école de démonstration pour le panel admin.",
                    'email'            => $s['email'],
                    'phone'            => $s['phone'],
                    'address'          => $s['city'],
                    'city'             => $s['city'],
                    'logo_url'         => $this->logoUrl($s['name']),
                    'license_number'   => 'DEMO-' . Str::upper(Str::slug($s['name'], '')),
                    'established_year' => 2018,
                    'status'           => $s['status'],
                    'is_active'        => $s['status'] === 'approved',
                    'verified_at'      => $s['status'] === 'approved' ? now() : null,
                    'rejection_reason' => $s['rejection_reason'] ?? null,
                ]
            );
        }
    }

    private function seedRoleDiversityUsers(): void
    {
        $admins = [
            ['name' => 'Sara Elidrissi', 'email' => 'support@autoecoles.ma',   'role_name' => 'support'],
            ['name' => 'Omar Chraibi',   'email' => 'moderator@autoecoles.ma', 'role_name' => 'moderator'],
        ];

        foreach ($admins as $a) {
            $tier = Role::where('name', $a['role_name'])->first();
            if (! $tier) {
                continue;
            }

            $user = User::updateOrCreate(
                ['email' => $a['email']],
                [
                    'name'      => $a['name'],
                    'password'  => Hash::make('password'),
                    'role'      => User::ROLE_ADMIN,
                    'role_id'   => $tier->id,
                    'is_active' => true,
                ]
            );
            $user->markEmailAsVerified();
        }

        // "Élève" demo accounts — varied statuses so the Users list shows every badge state.
        $students = [
            ['name' => 'Yasmine Alaoui', 'email' => 'eleve1-demo@autoecoles.ma', 'is_active' => true,  'status' => 0],
            ['name' => 'Mehdi Tazi',     'email' => 'eleve2-demo@autoecoles.ma', 'is_active' => false, 'status' => 0],
            ['name' => 'Sofia Bennis',   'email' => 'eleve3-demo@autoecoles.ma', 'is_active' => false, 'status' => 1],
        ];

        foreach ($students as $st) {
            $user = User::updateOrCreate(
                ['email' => $st['email']],
                [
                    'name'      => $st['name'],
                    'password'  => Hash::make('password'),
                    'role'      => User::ROLE_USER,
                    'is_active' => $st['is_active'],
                    'status'    => $st['status'],
                ]
            );
            $user->markEmailAsVerified();
        }
    }

    private function seedExampleNotifications(): void
    {
        $eleve  = User::where('email', 'eleve1-demo@autoecoles.ma')->first();
        $salam  = AutoSchool::where('slug', 'auto-ecole-salam')->first();
        $atlas  = AutoSchool::where('slug', 'auto-ecole-atlas')->first();
        $alamal = AutoSchool::where('slug', 'auto-ecole-al-amal')->first();

        $examples = [
            [
                'type' => 'user_registered',
                'data' => [
                    'type' => 'user_registered', 'icon' => '👤',
                    'title' => 'Nouvelle inscription',
                    'body'  => $eleve ? "{$eleve->name} ({$eleve->email})" : 'Nouvel utilisateur inscrit',
                    'url'   => route('admin.users.index'),
                ],
            ],
            [
                'type' => 'school_application',
                'data' => [
                    'type' => 'school_application', 'icon' => '🏫',
                    'title' => 'Nouvelle auto-école',
                    'body'  => $salam ? "{$salam->name} — {$salam->city} (en attente)" : 'Nouvelle candidature auto-école',
                    'url'   => route('admin.auto-schools.index', ['status' => 'pending']),
                ],
            ],
            [
                'type' => 'payment_received',
                'data' => [
                    'type' => 'payment_received', 'icon' => '💳',
                    'title' => 'Paiement reçu',
                    'body'  => $atlas ? "{$atlas->name} — 599 MAD (Plan Pro)" : 'Nouveau paiement reçu',
                    'url'   => route('admin.payments.index'),
                ],
            ],
            [
                'type' => 'subscription_expiring',
                'data' => [
                    'type' => 'subscription_expiring', 'icon' => '⏰',
                    'title' => 'Abonnement expirant',
                    'body'  => $alamal ? "{$alamal->name} — expire dans 5 jours" : 'Un abonnement expire bientôt',
                    'url'   => route('admin.subscriptions.index'),
                ],
            ],
            [
                'type' => 'report_flagged',
                'data' => [
                    'type' => 'report_flagged', 'icon' => '🚩',
                    'title' => 'Nouveau signalement',
                    'body'  => 'Avis signalé — contenu à modérer',
                    'url'   => route('admin.signalements.index'),
                ],
            ],
        ];

        $admins = User::admins()->get();
        $now    = now();

        foreach ($admins as $admin) {
            foreach ($examples as $i => $example) {
                $exists = DB::table('notifications')
                    ->where('notifiable_id', $admin->id)
                    ->where('notifiable_type', User::class)
                    ->where('type', 'App\\Notifications\\Demo\\' . Str::studly($example['type']))
                    ->exists();

                if ($exists) {
                    continue;
                }

                DB::table('notifications')->insert([
                    'id'               => (string) Str::uuid(),
                    'type'             => 'App\\Notifications\\Demo\\' . Str::studly($example['type']),
                    'notifiable_type'  => User::class,
                    'notifiable_id'    => $admin->id,
                    'data'             => json_encode($example['data'], JSON_UNESCAPED_UNICODE),
                    'read_at'          => null,
                    'created_at'       => $now->copy()->subMinutes($i * 12),
                    'updated_at'       => $now->copy()->subMinutes($i * 12),
                ]);
            }
        }
    }
}
