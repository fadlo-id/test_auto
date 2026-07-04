<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use App\Models\Region;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegionsController extends Controller
{
    public function index(Request $request): Response
    {
        $regions = Region::withCount(['schools as schools_count'])
            ->when($request->search, fn ($q, $s) =>
                $q->where('name', 'like', "%$s%")->orWhere('code', 'like', "%$s%")
            )
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Regions', [
            'regions' => $regions,
            'filters' => $request->only(['search']),
            'stats'   => [
                'total'  => Region::count(),
                'active' => Region::where('is_active', true)->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:regions,name',
            'code'      => 'required|string|max:20|unique:regions,code',
            'capital'   => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $data['code'] = strtoupper($data['code']);
        Region::create($data);

        return back()->with('success', "Région «{$data['name']}» créée.");
    }

    public function update(Request $request, Region $region): RedirectResponse
    {
        $data = $request->validate([
            'name'      => 'required|string|max:100|unique:regions,name,' . $region->id,
            'code'      => 'required|string|max:20|unique:regions,code,' . $region->id,
            'capital'   => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $data['code'] = strtoupper($data['code']);
        $region->update($data);

        return back()->with('success', "Région «{$region->name}» mise à jour.");
    }

    public function destroy(Region $region): RedirectResponse
    {
        $name = $region->name;
        $region->delete();

        return back()->with('success', "Région «{$name}» supprimée.");
    }
}
