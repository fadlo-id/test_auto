<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\SchoolApplicationApprovedMail;
use App\Mail\SchoolApplicationRejectedMail;
use App\Models\AutoSchool;
use App\Models\SchoolApplication;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SchoolApplicationsController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', SchoolApplication::class);

        $applications = SchoolApplication::query()
            ->when($request->search, fn ($q, $s) => $q->where(fn ($qq) => $qq
                ->where('school_name', 'like', "%{$s}%")
                ->orWhere('owner_name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
            ))
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->when($request->city, fn ($q, $c) => $q->where('city', $c))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'total'    => SchoolApplication::count(),
            'pending'  => SchoolApplication::status('pending')->count(),
            'approved' => SchoolApplication::status('approved')->count(),
            'rejected' => SchoolApplication::status('rejected')->count(),
        ];

        return Inertia::render('Admin/SchoolApplications/Index', [
            'applications' => $applications,
            'filters'      => $request->only(['search', 'status', 'city']),
            'stats'        => $stats,
        ]);
    }

    public function show(SchoolApplication $application): Response
    {
        $this->authorize('view', $application);

        $application->load(['media', 'projects', 'reviewer:id,name', 'createdAutoSchool:id,name,slug', 'createdUser:id,name,email']);

        return Inertia::render('Admin/SchoolApplications/Show', [
            'application' => $application,
        ]);
    }

    public function approve(SchoolApplication $application): RedirectResponse
    {
        $this->authorize('approve', $application);

        abort_if(! $application->isPending(), 422, 'Cette candidature a déjà été traitée.');

        $existingUser = User::where('email', $application->email)->first();

        if ($existingUser && $existingUser->autoSchool) {
            return back()->with('error', "Le compte {$application->email} possède déjà une auto-école. Traitez ce cas manuellement.");
        }

        $newAccountCreated = false;

        if ($existingUser) {
            $user = $existingUser;
            if (! $user->isSchoolOwner()) {
                $user->update(['role' => User::ROLE_SCHOOL_OWNER]);
            }
        } else {
            $user = User::create([
                'name'              => $application->owner_name,
                'email'             => $application->email,
                'phone'             => $application->phone_mobile ?: $application->phone_landline,
                'password'          => Hash::make(Str::random(32)),
                'role'              => User::ROLE_SCHOOL_OWNER,
                'is_active'         => true,
                'email_verified_at' => now(),
            ]);
            $newAccountCreated = true;
        }

        $address = trim(collect([$application->district, $application->address])->filter()->implode(', '));

        $school = AutoSchool::create([
            'user_id'          => $user->id,
            'name'             => $application->school_name,
            'description'      => $application->description,
            'email'            => $application->email,
            'phone'            => $application->phone_landline ?: $application->phone_mobile,
            'address'          => $address,
            'city'             => $application->city,
            // Not collected by the onboarding form (not part of the spec) — the schema requires
            // a unique value, so generate a traceable placeholder tied back to the application.
            'license_number'   => 'APP-' . $application->id . '-' . Str::upper(Str::random(6)),
            'established_year' => $application->founded_at?->year,
            'website_url'      => $application->website_url,
            'facebook_url'     => $application->facebook_url,
            'instagram_url'    => $application->instagram_url,
            'status'           => 'approved',
            'is_active'        => true,
            'verified_at'      => now(),
        ]);

        if (! empty($application->categories)) {
            $school->categories()->attach($application->categories);
        }

        $this->transferMedia($application, $school);

        $application->update([
            'status'                 => 'approved',
            'reviewed_by'            => auth()->id(),
            'reviewed_at'            => now(),
            'created_auto_school_id' => $school->id,
            'created_user_id'        => $user->id,
        ]);

        $this->clearPublicCaches();

        try {
            Mail::to($application->email)->queue(new SchoolApplicationApprovedMail($application, $school, $newAccountCreated));
        } catch (\Throwable $e) {
            Log::warning('School application approved email failed to send', ['application_id' => $application->id, 'error' => $e->getMessage()]);
        }

        if ($newAccountCreated) {
            try {
                Password::sendResetLink(['email' => $user->email]);
            } catch (\Throwable $e) {
                Log::warning('Password setup link failed to send for new school owner', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            }
        }

        return back()->with('success', "« {$school->name} » a été créée et est désormais en ligne.");
    }

    public function reject(Request $request, SchoolApplication $application): RedirectResponse
    {
        $this->authorize('reject', $application);

        abort_if(! $application->isPending(), 422, 'Cette candidature a déjà été traitée.');

        $data = $request->validate(['reason' => 'required|string|max:1000']);

        $application->update([
            'status'           => 'rejected',
            'rejection_reason' => $data['reason'],
            'reviewed_by'      => auth()->id(),
            'reviewed_at'      => now(),
        ]);

        try {
            Mail::to($application->email)->queue(new SchoolApplicationRejectedMail($application));
        } catch (\Throwable $e) {
            Log::warning('School application rejected email failed to send', ['application_id' => $application->id, 'error' => $e->getMessage()]);
        }

        return back()->with('success', 'Candidature refusée.');
    }

    public function destroy(SchoolApplication $application): RedirectResponse
    {
        $this->authorize('delete', $application);

        foreach ($application->media as $media) {
            Storage::disk('public')->delete($media->path);
        }

        $application->delete();

        return back()->with('success', 'Candidature supprimée.');
    }

    private function transferMedia(SchoolApplication $application, AutoSchool $school): void
    {
        $logo = $application->logo()->first();
        if ($logo) {
            $newPath = 'schools/logos/' . basename($logo->path);
            if (Storage::disk('public')->exists($logo->path)) {
                Storage::disk('public')->move($logo->path, $newPath);
                $school->update(['logo_url' => $newPath]);
            }
        }

        $sortOrder = 0;
        foreach ($application->galleryMedia as $media) {
            $newPath = "schools/{$school->id}/gallery/" . basename($media->path);
            if (Storage::disk('public')->exists($media->path)) {
                Storage::disk('public')->move($media->path, $newPath);
                $school->photos()->create(['path' => $newPath, 'sort_order' => $sortOrder++]);
            }
        }
    }

    private function clearPublicCaches(): void
    {
        Cache::forget('home_page_data');
        Cache::forget('search_cities');
        Cache::forget('search_categories');
        Cache::forget('sitemap_data');
    }
}
