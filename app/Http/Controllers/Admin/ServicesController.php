<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServicesController extends Controller
{
    public function index(Request $request): Response
    {
        $services = Service::with('autoSchool:id,name,city')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Services', [
            'services' => $services,
            'filters'  => $request->only(['search']),
        ]);
    }

    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();
        return back()->with('success', 'Service supprimé.');
    }
}
