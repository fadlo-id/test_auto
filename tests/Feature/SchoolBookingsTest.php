<?php

namespace Tests\Feature;

use App\Models\AutoSchool;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolBookingsTest extends TestCase
{
    use RefreshDatabase;

    private function ownerWithSchool(): array
    {
        $owner  = User::factory()->create(['role' => 'school_owner']);
        $school = AutoSchool::factory()->create([
            'user_id'   => $owner->id,
            'status'    => 'approved',
            'is_active' => true,
        ]);

        return [$owner, $school];
    }

    private function makeBooking(int $schoolId, array $attrs = []): Booking
    {
        return Booking::create(array_merge([
            'auto_school_id' => $schoolId,
            'name'           => 'Test Client',
            'email'          => 'client@example.com',
            'phone'          => '0600000000',
            'status'         => 'pending',
        ], $attrs));
    }

    public function test_owner_only_sees_own_school_bookings(): void
    {
        [$owner, $school] = $this->ownerWithSchool();
        [, $otherSchool]  = $this->ownerWithSchool();

        $this->makeBooking($school->id);
        $this->makeBooking($school->id);
        $this->makeBooking($otherSchool->id);

        $response = $this->actingAs($owner)->get(route('school.bookings'));

        $response->assertOk()->assertInertia(fn ($p) => $p
            ->component('SchoolDashboard/Bookings')
            ->where('bookings.total', 2)
        );
    }

    public function test_search_does_not_leak_bookings_from_other_schools(): void
    {
        [$owner, $school] = $this->ownerWithSchool();
        [, $otherSchool]  = $this->ownerWithSchool();

        $this->makeBooking($school->id, ['name' => 'Ali Benali', 'email' => 'ali@example.com']);

        // A booking on a DIFFERENT school whose email matches the search term used below.
        $this->makeBooking($otherSchool->id, ['name' => 'Someone Else', 'email' => 'zzz-match@example.com']);

        $response = $this->actingAs($owner)
            ->get(route('school.bookings', ['search' => 'zzz-match']));

        $response->assertOk()->assertInertia(fn ($p) => $p
            ->component('SchoolDashboard/Bookings')
            ->where('bookings.total', 0)
        );
    }

    public function test_owner_cannot_update_another_schools_booking(): void
    {
        [$owner]          = $this->ownerWithSchool();
        [, $otherSchool]  = $this->ownerWithSchool();
        $booking          = $this->makeBooking($otherSchool->id);

        $this->actingAs($owner)
            ->put(route('school.bookings.update', $booking), ['status' => 'confirmed'])
            ->assertForbidden();
    }
}
