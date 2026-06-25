<?php

namespace App\Http\Controllers\Api;

use App\Models\AutoSchool;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller; 

class AutoSchoolController extends Controller
{
    // LIST - GET /api/auto-schools
    public function index(Request $request)
    {
        $query = AutoSchool::where('is_active', true)
            ->with(['categories', 'reviews', 'user']);

        // Filter by city
        if ($request->city) {
            $query->where('city', $request->city);
        }

        // Search
        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('city', 'like', "%{$request->search}%");
        }

        // Filter by rating
        if ($request->min_rating) {
            $query->withAvg('reviews', 'rating')
                ->havingRaw('avg(reviews.rating) >= ?', [$request->min_rating]);
        }

        return $query->paginate(15);
    }

    // SHOW - GET /api/auto-schools/{slug}
    public function show($slug)
    {
        $school = AutoSchool::where('slug', $slug)
            ->with(['categories', 'services', 'reviews.user', 'user'])
            ->firstOrFail();

        // Increment view count
        $today = now()->toDateString();
        $stat = $school->stats()->where('date', $today)->first();
        
        if ($stat) {
            $stat->increment('views_count');
        } else {
            $school->stats()->create([
                'date' => $today,
                'views_count' => 1,
            ]);
        }

        return $school;
    }

    // CREATE - POST /api/auto-schools
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'region' => 'nullable|string',
            'license_number' => 'required|string|unique:auto_schools',
            'categories' => 'required|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $school = $request->user()->autoSchools()->create($validated);
        $school->categories()->attach($validated['categories']);

        return response()->json($school->load('categories'), 201);
    }

    // UPDATE - PUT /api/auto-schools/{id}
    public function update(Request $request, AutoSchool $autoSchool)
    {
        // Check ownership
        if ($autoSchool->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'email' => 'sometimes|email',
            'phone' => 'sometimes|string',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'categories' => 'sometimes|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $autoSchool->update($validated);

        if (isset($validated['categories'])) {
            $autoSchool->categories()->sync($validated['categories']);
        }

        return response()->json($autoSchool);
    }

    // DELETE - DELETE /api/auto-schools/{id}
    public function destroy(AutoSchool $autoSchool)
    {
        if ($autoSchool->user_id !== auth()->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $autoSchool->delete();
        return response()->json(null, 204);
    }
}