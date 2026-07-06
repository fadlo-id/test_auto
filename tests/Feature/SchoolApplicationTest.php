<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Category;
use App\Models\Role;
use App\Models\SchoolApplication;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SchoolApplicationTest extends TestCase
{
    use RefreshDatabase;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->category = Category::create(['code' => 'VOI', 'name_fr' => 'Voiture']);
        Mail::fake();
        Notification::fake();
    }

    private function validPayload(array $overrides = []): array
    {
        $hours = [];
        foreach (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as $day) {
            $hours[$day] = ['open' => '09:00', 'close' => '18:00', 'closed' => false];
        }
        $hours['sunday'] = ['open' => null, 'close' => null, 'closed' => true];

        return array_merge([
            'school_name'    => 'Auto-École Test',
            'owner_name'     => 'Jane Doe',
            'city'           => 'Casablanca',
            'address'        => '123 Boulevard Test',
            'phone_mobile'   => '0612345678',
            'email'          => 'jane@example.com',
            'description'    => 'Une excellente auto-école.',
            'categories'     => [$this->category->id],
            'opening_hours'  => $hours,
        ], $overrides);
    }

    private function admin(array $permissions = []): User
    {
        $role = Role::where('name', 'admin')->firstOrFail();
        $admin = User::factory()->create(['role' => 'admin', 'role_id' => $role->id, 'is_active' => true]);
        if ($permissions) {
            $admin->syncPermissions($permissions);
        }
        return $admin;
    }

    // ── Public submission ──────────────────────────────────────────────

    public function test_create_page_renders(): void
    {
        $this->get(route('school-application.create'))->assertOk();
    }

    public function test_guest_can_submit_a_valid_application(): void
    {
        $this->post(route('school-application.store'), $this->validPayload())
            ->assertRedirect(route('school-application.success'));

        $this->assertDatabaseHas('school_applications', [
            'school_name' => 'Auto-École Test',
            'status'      => 'pending',
        ]);
    }

    public function test_submission_notifies_super_admins_and_confirms_to_applicant(): void
    {
        $superAdmin = User::factory()->create(['role' => User::ROLE_SUPER_ADMIN, 'is_active' => true]);

        $this->post(route('school-application.store'), $this->validPayload());

        Notification::assertSentTo($superAdmin, \App\Notifications\NewSchoolApplicationNotification::class);
        Mail::assertQueued(\App\Mail\SchoolApplicationReceivedMail::class, fn ($mail) => $mail->application->email === 'jane@example.com');
    }

    public function test_validation_rejects_missing_required_fields(): void
    {
        $response = $this->post(route('school-application.store'), []);
        $response->assertSessionHasErrors(['school_name', 'owner_name', 'city', 'address', 'phone_mobile', 'email', 'description', 'categories', 'opening_hours']);
    }

    public function test_validation_requires_open_close_times_when_day_not_closed(): void
    {
        $payload = $this->validPayload();
        $payload['opening_hours']['monday'] = ['open' => null, 'close' => null, 'closed' => false];

        $this->post(route('school-application.store'), $payload)
            ->assertSessionHasErrors(['opening_hours.monday.open', 'opening_hours.monday.close']);
    }

    public function test_submission_stores_logo_and_gallery_media(): void
    {
        Storage::fake('public');

        $payload = $this->validPayload([
            'logo'    => UploadedFile::fake()->create('logo.jpg', 50, 'image/jpeg'),
            'gallery' => [
                UploadedFile::fake()->create('a.jpg', 50, 'image/jpeg'),
                UploadedFile::fake()->create('b.jpg', 50, 'image/jpeg'),
            ],
        ]);

        $this->post(route('school-application.store'), $payload)->assertRedirect();

        $application = SchoolApplication::firstOrFail();
        $this->assertCount(3, $application->media);
        $this->assertSame(1, $application->media()->where('type', 'logo')->count());
        $this->assertSame(2, $application->media()->where('type', 'gallery')->count());
    }

    public function test_submission_rejects_non_image_upload(): void
    {
        Storage::fake('public');

        $payload = $this->validPayload([
            'logo' => UploadedFile::fake()->create('malware.exe', 50, 'application/octet-stream'),
        ]);

        $this->post(route('school-application.store'), $payload)->assertSessionHasErrors('logo');
    }

    public function test_submission_stores_repeatable_projects(): void
    {
        $payload = $this->validPayload([
            'projects' => [
                ['title' => 'Centre de formation professionnelle', 'description' => 'Formation continue', 'year' => 2020],
            ],
        ]);

        $this->post(route('school-application.store'), $payload)->assertRedirect();

        $application = SchoolApplication::firstOrFail();
        $this->assertCount(1, $application->projects);
        $this->assertSame('Centre de formation professionnelle', $application->projects->first()->title);
    }

    /**
     * Regression: the real browser submits this form as multipart/form-data (required
     * because file uploads share the same request), which serializes every value —
     * including JS booleans — to a string ("0"/"1"). A non-empty string is truthy in
     * both JS and a naive PHP check, so every day used to render as closed regardless
     * of what was actually selected — caught via live Playwright verification, not by
     * feature tests posting native PHP booleans. Simulate the real wire format here to
     * prove storage normalizes it back to real booleans.
     */
    public function test_opening_hours_closed_flag_is_normalized_from_stringified_form_data(): void
    {
        // Inertia's FormData serialization turns JS booleans into "0"/"1" (the form Laravel's
        // own `boolean` validation rule accepts) — not the spelled-out "false"/"true".
        $hours = [];
        foreach (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as $day) {
            $hours[$day] = ['open' => '09:00', 'close' => '18:00', 'closed' => '0'];
        }
        $hours['sunday'] = ['open' => '', 'close' => '', 'closed' => '1'];

        $this->post(route('school-application.store'), $this->validPayload(['opening_hours' => $hours]))
            ->assertRedirect(route('school-application.success'));

        $application = SchoolApplication::firstOrFail();
        $this->assertFalse($application->opening_hours['monday']['closed']);
        $this->assertTrue($application->opening_hours['sunday']['closed']);
        $this->assertIsBool($application->opening_hours['monday']['closed']);
        $this->assertIsBool($application->opening_hours['sunday']['closed']);
    }

    public function test_submission_is_rate_limited_per_ip(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post(route('school-application.store'), $this->validPayload(['email' => "test{$i}@example.com"]));
        }

        $response = $this->post(route('school-application.store'), $this->validPayload(['email' => 'sixth@example.com']));
        $response->assertStatus(429);
    }

    // ── Admin authorization ──────────────────────────────────────────────

    public function test_guest_cannot_access_admin_moderation(): void
    {
        $this->get(route('admin.school-applications.index'))->assertRedirect(route('login'));
    }

    public function test_admin_without_manage_schools_permission_is_forbidden(): void
    {
        $admin = $this->admin([]);
        $this->actingAs($admin)->get(route('admin.school-applications.index'))->assertForbidden();
    }

    public function test_admin_with_manage_schools_permission_can_view(): void
    {
        $admin = $this->admin(['manage_schools']);
        $this->actingAs($admin)->get(route('admin.school-applications.index'))->assertOk();
    }

    // ── Approval workflow ──────────────────────────────────────────────

    public function test_approve_creates_new_user_and_school(): void
    {
        $admin = $this->admin(['manage_schools']);
        $application = SchoolApplication::create($this->applicationAttributes());

        $this->actingAs($admin)
            ->post(route('admin.school-applications.approve', $application))
            ->assertRedirect();

        $application->refresh();
        $this->assertSame('approved', $application->status);
        $this->assertNotNull($application->created_auto_school_id);
        $this->assertNotNull($application->created_user_id);

        $user = User::find($application->created_user_id);
        $this->assertSame(User::ROLE_SCHOOL_OWNER, $user->role);

        $school = AutoSchool::find($application->created_auto_school_id);
        $this->assertSame('approved', $school->status);
        $this->assertTrue($school->is_active);
        $this->assertSame($this->category->id, $school->categories->first()->id);

        Mail::assertQueued(\App\Mail\SchoolApplicationApprovedMail::class);
    }

    public function test_approve_links_existing_user_without_a_school(): void
    {
        $admin = $this->admin(['manage_schools']);
        $existing = User::factory()->create(['email' => 'existing@example.com', 'role' => 'user']);
        $application = SchoolApplication::create($this->applicationAttributes(['email' => 'existing@example.com']));

        $this->actingAs($admin)->post(route('admin.school-applications.approve', $application));

        $application->refresh();
        $this->assertSame($existing->id, $application->created_user_id);
        $this->assertSame(User::ROLE_SCHOOL_OWNER, $existing->fresh()->role);
    }

    public function test_approve_blocks_when_existing_user_already_owns_a_school(): void
    {
        $admin = $this->admin(['manage_schools']);
        $existing = User::factory()->create(['email' => 'owner@example.com', 'role' => 'school_owner']);
        AutoSchool::factory()->create(['user_id' => $existing->id]);
        $application = SchoolApplication::create($this->applicationAttributes(['email' => 'owner@example.com']));

        $this->actingAs($admin)->post(route('admin.school-applications.approve', $application));

        $application->refresh();
        $this->assertSame('pending', $application->status);
    }

    public function test_cannot_approve_already_processed_application(): void
    {
        $admin = $this->admin(['manage_schools']);
        $application = SchoolApplication::create($this->applicationAttributes(['status' => 'approved']));

        $this->actingAs($admin)
            ->post(route('admin.school-applications.approve', $application))
            ->assertStatus(422);
    }

    public function test_reject_updates_status_and_sends_email(): void
    {
        $admin = $this->admin(['manage_schools']);
        $application = SchoolApplication::create($this->applicationAttributes());

        $this->actingAs($admin)
            ->post(route('admin.school-applications.reject', $application), ['reason' => 'Documents manquants'])
            ->assertRedirect();

        $application->refresh();
        $this->assertSame('rejected', $application->status);
        $this->assertSame('Documents manquants', $application->rejection_reason);
        Mail::assertQueued(\App\Mail\SchoolApplicationRejectedMail::class);
    }

    public function test_reject_requires_a_reason(): void
    {
        $admin = $this->admin(['manage_schools']);
        $application = SchoolApplication::create($this->applicationAttributes());

        $this->actingAs($admin)
            ->post(route('admin.school-applications.reject', $application), [])
            ->assertSessionHasErrors('reason');
    }

    public function test_admin_can_delete_an_application(): void
    {
        $admin = $this->admin(['manage_schools']);
        $application = SchoolApplication::create($this->applicationAttributes());

        $this->actingAs($admin)
            ->delete(route('admin.school-applications.destroy', $application))
            ->assertRedirect();

        $this->assertSoftDeleted('school_applications', ['id' => $application->id]);
    }

    private function applicationAttributes(array $overrides = []): array
    {
        return array_merge([
            'status'         => 'pending',
            'school_name'    => 'Auto-École Attributes',
            'owner_name'     => 'John Owner',
            'city'           => 'Rabat',
            'address'        => '1 Rue Test',
            'phone_mobile'   => '0600000000',
            'email'          => 'app@example.com',
            'description'    => 'Description test.',
            'categories'     => [$this->category->id],
        ], $overrides);
    }
}
