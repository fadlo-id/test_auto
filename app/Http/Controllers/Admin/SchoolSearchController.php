<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AutoSchool;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Dedicated "Recherche d'auto-écoles" admin page — a focused, multi-criteria finder
 * (name / city / status / owner) distinct from the Auto-écoles CRUD list, which is
 * meant for browsing/managing rather than pinpointing one specific record fast.
 */
class SchoolSearchController extends Controller
{
    public function index(Request $request): Response
    {
        $hasQuery = $request->filled('name') || $request->filled('city') || $request->filled('status') || $request->filled('owner');

        $schools = $hasQuery
            ? AutoSchool::with('user:id,name,email')
                ->when($request->name, fn ($q, $v) => $q->where('name', 'like', "%{$v}%"))
                ->when($request->city, fn ($q, $v) => $q->where('city', 'like', "%{$v}%"))
                ->when($request->status && $request->status !== 'all', fn ($q) => $q->where('status', $request->status))
                ->when($request->owner, fn ($q, $v) => $q->whereHas('user', fn ($uq) => $uq
                    ->where('name', 'like', "%{$v}%")->orWhere('email', 'like', "%{$v}%")
                ))
                ->latest()
                ->paginate(20)
                ->withQueryString()
            : null;

        return Inertia::render('Admin/SchoolSearch', [
            'schools' => $schools,
            'filters' => $request->only(['name', 'city', 'status', 'owner']),
        ]);
    }
}
