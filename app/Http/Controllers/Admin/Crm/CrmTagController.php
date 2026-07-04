<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CrmTagController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/CRM/Tags/Index', [
            'tags' => CrmTag::withCount('prospects')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:80|unique:crm_tags,name',
            'color' => 'required|regex:/^#[0-9a-fA-F]{6}$/',
        ]);

        CrmTag::create($data);
        return back()->with('success', 'Tag créé.');
    }

    public function update(Request $request, CrmTag $tag): RedirectResponse
    {
        $data = $request->validate([
            'name'  => "required|string|max:80|unique:crm_tags,name,{$tag->id}",
            'color' => 'required|regex:/^#[0-9a-fA-F]{6}$/',
        ]);

        $tag->update($data);
        return back()->with('success', 'Tag mis à jour.');
    }

    public function destroy(CrmTag $tag): RedirectResponse
    {
        $tag->delete();
        return back()->with('success', 'Tag supprimé.');
    }
}
