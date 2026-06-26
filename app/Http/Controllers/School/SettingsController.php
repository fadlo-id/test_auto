<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAutoSchoolRequest;
use App\Http\Requests\UpdateAutoSchoolRequest;
use App\Models\AutoSchool;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $school = auth()->user()->autoSchool;
        $categories = Category::all(['id', 'name', 'slug']);

        return Inertia::render('SchoolDashboard/Settings', [
            'school'     => $school?->load('categories'),
            'categories' => $categories,
        ]);
    }

    public function store(StoreAutoSchoolRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $categories = $validated['categories'] ?? [];

        $school = AutoSchool::create(array_merge(
            collect($validated)->except('categories')->toArray(),
            ['user_id' => auth()->id(), 'status' => 'pending']
        ));

        if ($categories) {
            $school->categories()->attach($categories);
        }

        return redirect()->route('school.dashboard')
            ->with('success', 'Auto-école créée ! En attente de validation.');
    }

    public function update(Request $request): RedirectResponse
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school, 404);

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string|max:2000',
            'email'            => "required|email|max:255|unique:auto_schools,email,{$school->id}",
            'phone'            => 'required|string|max:20',
            'address'          => 'required|string|max:255',
            'city'             => 'required|string|max:100',
            'region'           => 'nullable|string|max:100',
            'website_url'      => 'nullable|url|max:255',
            'facebook_url'     => 'nullable|url|max:255',
            'instagram_url'    => 'nullable|url|max:255',
            'latitude'         => 'nullable|numeric|between:-90,90',
            'longitude'        => 'nullable|numeric|between:-180,180',
            'categories'       => 'sometimes|array',
            'categories.*'     => 'exists:categories,id',
        ]);

        $categories = $validated['categories'] ?? null;
        $school->update(collect($validated)->except('categories')->toArray());

        if ($categories !== null) {
            $school->categories()->sync($categories);
        }

        return back()->with('success', 'Profil mis à jour avec succès.');
    }

    public function uploadLogo(Request $request): RedirectResponse
    {
        $request->validate(['logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120']);

        $school = auth()->user()->autoSchool;
        abort_if(! $school, 404);

        if ($school->logo_url) {
            Storage::disk('public')->delete($school->logo_url);
        }

        $path = $request->file('logo')->store('schools/logos', 'public');
        $school->update(['logo_url' => $path]);

        return back()->with('success', 'Logo mis à jour.');
    }

    public function uploadBanner(Request $request): RedirectResponse
    {
        $request->validate(['banner' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240']);

        $school = auth()->user()->autoSchool;
        abort_if(! $school, 404);

        if ($school->banner_url) {
            Storage::disk('public')->delete($school->banner_url);
        }

        $path = $request->file('banner')->store('schools/banners', 'public');
        $school->update(['banner_url' => $path]);

        return back()->with('success', 'Bannière mise à jour.');
    }
}
