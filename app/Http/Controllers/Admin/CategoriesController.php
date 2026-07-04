<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class CategoriesController extends Controller
{
    public function index(): Response
    {
        $categories = Category::withCount('autoSchools')
            ->orderBy('code')
            ->get();

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code'    => 'required|string|max:10|unique:categories,code',
            'name_fr' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'name_en' => 'nullable|string|max:100',
        ]);

        Category::create($validated);
        Cache::forget('search_categories');

        return back()->with('success', 'Catégorie créée avec succès.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'code'    => "required|string|max:10|unique:categories,code,{$category->id}",
            'name_fr' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'name_en' => 'nullable|string|max:100',
        ]);

        $category->update($validated);
        Cache::forget('search_categories');

        return back()->with('success', 'Catégorie mise à jour.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->autoSchools()->detach();
        $category->delete();
        Cache::forget('search_categories');

        return back()->with('success', 'Catégorie supprimée.');
    }
}
