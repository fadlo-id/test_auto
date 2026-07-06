<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolApplicationRequest;
use App\Mail\SchoolApplicationReceivedMail;
use App\Models\Category;
use App\Models\SchoolApplication;
use App\Models\User;
use App\Notifications\NewSchoolApplicationNotification;
use App\Services\SeoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SchoolApplicationController extends Controller
{
    public function create(): Response
    {
        $categories = Cache::remember('search_categories', now()->addDay(), fn () => Category::all(['id', 'name_fr', 'name_ar', 'code']));

        return Inertia::render('Public/SchoolApplication/Create', [
            'categories' => $categories,
            'seo' => app(SeoService::class)->staticPage(
                'school-application',
                'Ajouter votre auto-école',
                'Inscrivez gratuitement votre auto-école sur AutoEcoles.ma et touchez des milliers de candidats au permis de conduire partout au Maroc.',
            ),
        ]);
    }

    public function store(StoreSchoolApplicationRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $projects = $validated['projects'] ?? [];
        unset($validated['projects'], $validated['logo'], $validated['gallery']);

        // The form is submitted as multipart/form-data (required for the file uploads on the
        // same request), which serializes every value to a string — so `closed: false` arrives
        // here as the literal string "false", which is truthy both in JS and in a naive PHP
        // boolean check. Normalize explicitly before persisting to the opening_hours JSON column.
        if (isset($validated['opening_hours'])) {
            foreach ($validated['opening_hours'] as $day => $hours) {
                $validated['opening_hours'][$day]['closed'] = filter_var($hours['closed'], FILTER_VALIDATE_BOOLEAN);
            }
        }

        $application = SchoolApplication::create(array_merge($validated, [
            'status'     => 'pending',
            'ip_address' => $request->ip(),
        ]));

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('school-applications/' . $application->id, 'public');
            $application->media()->create(['type' => 'logo', 'path' => $path, 'sort_order' => 0]);
        }

        foreach ($request->file('gallery', []) as $i => $file) {
            $path = $file->store('school-applications/' . $application->id, 'public');
            $application->media()->create(['type' => 'gallery', 'path' => $path, 'sort_order' => $i]);
        }

        foreach ($projects as $project) {
            if (empty($project['title'])) {
                continue;
            }
            $application->projects()->create([
                'title'       => $project['title'],
                'description' => $project['description'] ?? null,
                'year'        => $project['year'] ?? null,
            ]);
        }

        $this->notifySuperAdmins($application);

        try {
            Mail::to($application->email)->queue(new SchoolApplicationReceivedMail($application));
        } catch (\Throwable $e) {
            Log::warning('School application received email failed to send', ['application_id' => $application->id, 'error' => $e->getMessage()]);
        }

        return redirect()->route('school-application.success');
    }

    public function success(): Response
    {
        return Inertia::render('Public/SchoolApplication/Success', [
            'seo' => app(SeoService::class)->staticPage(
                'school-application-success',
                'Candidature envoyée',
                'Votre candidature a bien été envoyée à notre équipe.',
            ),
        ]);
    }

    private function notifySuperAdmins(SchoolApplication $application): void
    {
        User::where('role', User::ROLE_SUPER_ADMIN)
            ->where('is_active', true)
            ->get()
            ->each(function (User $admin) use ($application) {
                try {
                    $admin->notify(new NewSchoolApplicationNotification($application));
                } catch (\Throwable $e) {
                    Log::warning('New school application notification failed', ['admin_id' => $admin->id, 'error' => $e->getMessage()]);
                }
            });
    }
}
