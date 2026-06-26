<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServicesController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        return Inertia::render('SchoolDashboard/Services', [
            'school'   => $school->only('id', 'name'),
            'services' => $school->services()->get(),
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return back()->with('error', 'Aucune auto-école trouvée.');
        }

        $school->services()->create($request->validated());

        return back()->with('success', 'Service ajouté avec succès.');
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $this->authorizeSchool($service->auto_school_id);
        $service->update($request->validated());

        return back()->with('success', 'Service mis à jour.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $this->authorizeSchool($service->auto_school_id);
        $service->delete();

        return back()->with('success', 'Service supprimé.');
    }

    private function authorizeSchool(int $schoolId): void
    {
        $userSchool = auth()->user()->autoSchool;
        abort_if(! $userSchool || $userSchool->id !== $schoolId, 403);
    }
}
