<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\SchoolPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        $school = auth()->user()->autoSchool;

        if (! $school) {
            return redirect()->route('school.settings');
        }

        return Inertia::render('SchoolDashboard/Gallery', [
            'school' => $school->only('id', 'name', 'city', 'status'),
            'photos' => $school->photos()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'photos'   => 'required|array|min:1|max:10',
            'photos.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $school = auth()->user()->autoSchool;
        abort_if(! $school, 403);

        $count = $school->photos()->count();
        if ($count >= 12) {
            return back()->with('error', 'Maximum 12 photos par galerie.');
        }

        foreach ($request->file('photos') as $file) {
            $path = $file->store("schools/{$school->id}/gallery", 'public');
            $school->photos()->create([
                'path'       => $path,
                'sort_order' => $count++,
            ]);
        }

        return back()->with('success', count($request->file('photos')) . ' photo(s) ajoutée(s).');
    }

    public function destroy(SchoolPhoto $photo): RedirectResponse
    {
        $school = auth()->user()->autoSchool;
        abort_if(! $school || $photo->auto_school_id !== $school->id, 403);

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return back()->with('success', 'Photo supprimée.');
    }
}
