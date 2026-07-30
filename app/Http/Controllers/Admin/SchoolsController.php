<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SchoolsController extends Controller
{
    private const SORTABLE = ['name', 'city', 'status', 'created_at'];

    public function __construct(private NotificationService $notifications) {}

    public function index(Request $request): Response
    {
        $sort      = in_array($request->sort, self::SORTABLE, true) ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';

        $schools = AutoSchool::with('user:id,name,email')
            ->when($request->search, fn ($q, $s) => $q->where(fn ($qq) => $qq
                ->where('name', 'like', "%{$s}%")
                ->orWhere('city', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('phone', 'like', "%{$s}%")
            ))
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->when($request->city && $request->city !== 'all', fn ($q) => $q->where('city', $request->city))
            ->orderBy($sort, $direction)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/AutoSchools', [
            'schools' => $schools,
            'filters' => $request->only(['search', 'status', 'city', 'sort', 'direction']),
            'cities'  => AutoSchool::whereNotNull('city')->distinct()->orderBy('city')->pluck('city'),
            'available_owners' => User::where('role', User::ROLE_SCHOOL_OWNER)
                ->doesntHave('autoSchool')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    /** Direct creation by an admin (distinct from the public "school application" onboarding flow). */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|max:255',
            'phone'           => 'required|string|max:30',
            'city'            => 'required|string|max:120',
            'address'         => 'nullable|string|max:255',
            'logo_url'        => 'nullable|string|max:500',
            'status'          => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
            'owner_mode'      => ['required', Rule::in(['existing', 'new'])],
            'existing_user_id'=> 'required_if:owner_mode,existing|nullable|exists:users,id',
            'new_owner_name'  => 'required_if:owner_mode,new|nullable|string|max:255',
            'new_owner_email' => 'required_if:owner_mode,new|nullable|email|max:255|unique:users,email',
        ]);

        $newAccountCreated = false;

        if ($data['owner_mode'] === 'existing') {
            $owner = User::findOrFail($data['existing_user_id']);
            if ($owner->autoSchool) {
                throw ValidationException::withMessages(['existing_user_id' => 'Ce propriétaire a déjà une auto-école.']);
            }
            if (! $owner->isSchoolOwner()) {
                $owner->update(['role' => User::ROLE_SCHOOL_OWNER]);
            }
        } else {
            $owner = User::create([
                'name'              => $data['new_owner_name'],
                'email'             => $data['new_owner_email'],
                'password'          => Hash::make(Str::random(32)),
                'role'              => User::ROLE_SCHOOL_OWNER,
                'is_active'         => true,
                'email_verified_at' => now(),
            ]);
            $newAccountCreated = true;
        }

        $status = $data['status'] ?? 'approved';

        $school = AutoSchool::create([
            'user_id'        => $owner->id,
            'name'           => $data['name'],
            'email'          => $data['email'],
            'phone'          => $data['phone'],
            'address'        => $data['address'] ?? $data['city'],
            'city'           => $data['city'],
            'logo_url'       => $data['logo_url'] ?? null,
            // Not collected by this admin-facing quick-create form — the schema requires a
            // unique value, so generate a traceable placeholder (mirrors the school-application
            // approval flow's ADM- prefix convention).
            'license_number' => 'ADM-' . now()->format('ymd') . '-' . Str::upper(Str::random(6)),
            'status'         => $status,
            'is_active'      => $status === 'approved',
            'verified_at'    => $status === 'approved' ? now() : null,
        ]);

        $this->clearPublicCaches();

        if ($newAccountCreated) {
            try {
                Password::sendResetLink(['email' => $owner->email]);
            } catch (\Throwable $e) {
                Log::warning("Password setup link failed to send for new school owner #{$owner->id}: {$e->getMessage()}");
            }
        }

        return back()->with('success', "Auto-école \"{$school->name}\" créée.");
    }

    public function update(Request $request, AutoSchool $school): RedirectResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255',
            'phone'    => 'required|string|max:30',
            'city'     => 'required|string|max:120',
            'address'  => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|max:500',
            'status'   => ['required', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $school->update($data);
        $this->clearPublicCaches();

        return back()->with('success', "Auto-école \"{$school->name}\" mise à jour.");
    }

    public function approve(AutoSchool $school): RedirectResponse
    {
        $school->update([
            'status'           => 'approved',
            'is_active'        => true,
            'verified_at'      => now(),
            'rejection_reason' => null,
        ]);

        $this->notifications->notifySchoolApproved($school);
        $this->clearPublicCaches();

        return back()->with('success', "Auto-ecole \"{$school->name}\" approuvee.");
    }

    public function reject(Request $request, AutoSchool $school): RedirectResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $school->update([
            'status'           => 'rejected',
            'is_active'        => false,
            'rejection_reason' => $request->reason,
            'verified_at'      => null,
        ]);

        $this->notifications->notifySchoolRejected($school, $request->reason);
        $this->clearPublicCaches();

        return back()->with('success', "Auto-ecole \"{$school->name}\" refusee.");
    }

    public function deactivate(AutoSchool $school): RedirectResponse
    {
        $school->update(['is_active' => false]);
        $this->clearPublicCaches();
        return back()->with('success', "Auto-ecole \"{$school->name}\" desactivee.");
    }

    public function activate(AutoSchool $school): RedirectResponse
    {
        abort_if($school->status !== 'approved', 422, 'L\'auto-ecole doit etre approuvee avant activation.');
        $school->update(['is_active' => true]);
        $this->clearPublicCaches();
        return back()->with('success', "Auto-ecole \"{$school->name}\" activee.");
    }

    private function clearPublicCaches(): void
    {
        Cache::forget('home_page_data');
        Cache::forget('search_cities');
        Cache::forget('search_categories');
        Cache::forget('sitemap_data');
    }

    public function destroy(AutoSchool $school): RedirectResponse
    {
        $school->delete();
        $this->clearPublicCaches();

        return back()->with('success', 'Auto-ecole supprimee.');
    }

    public function export(Request $request): HttpResponse
    {
        $schools = AutoSchool::with('user:id,name,email')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('city', 'like', "%{$s}%"))
            ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->get(['id', 'name', 'city', 'status', 'is_active', 'user_id', 'created_at']);

        $header = implode(',', ['ID', 'Nom', 'Ville', 'Statut', 'Actif', 'Propriétaire', 'Date inscription']);
        $rows   = $schools->map(fn ($s) => implode(',', [
            $s->id,
            '"' . str_replace('"', '""', $s->name) . '"',
            '"' . ($s->city ?? '') . '"',
            $s->status,
            $s->is_active ? 'Oui' : 'Non',
            '"' . str_replace('"', '""', $s->user?->name ?? '') . '"',
            $s->created_at?->format('d/m/Y'),
        ]));

        $csv = $header . "\n" . $rows->implode("\n");

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="auto_ecoles_' . now()->format('Ymd') . '.csv"',
        ]);
    }
}
