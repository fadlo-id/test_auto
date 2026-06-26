<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAutoSchoolRequest;
use App\Http\Requests\UpdateAutoSchoolRequest;
use App\Http\Resources\AutoSchoolResource;
use App\Models\AutoSchool;
use App\Services\TrackingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AutoSchoolController extends Controller
{
    public function __construct(private TrackingService $trackingService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = AutoSchool::active()
            ->with(['categories', 'subscription.plan']);

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('city', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        if ($request->filled('min_rating')) {
            $query->withAvg('reviews as avg_rating', 'rating')
                ->having('avg_rating', '>=', $request->min_rating);
        }

        if ($request->filled('category')) {
            $query->whereHas('categories', fn($q) => $q->where('slug', $request->category));
        }

        $schools = $query->latest()->paginate(15);

        return AutoSchoolResource::collection($schools);
    }

    public function show(Request $request, string $slug): AutoSchoolResource
    {
        $school = AutoSchool::where('slug', $slug)
            ->with(['categories', 'services', 'reviews.user', 'subscription.plan'])
            ->firstOrFail();

        $this->trackingService->trackView($school, $request, $request->user()?->id);

        return new AutoSchoolResource($school);
    }

    public function store(StoreAutoSchoolRequest $request): AutoSchoolResource
    {
        $validated = $request->validated();
        $categories = $validated['categories'] ?? [];

        $school = AutoSchool::create(array_merge(
            collect($validated)->except('categories')->toArray(),
            ['user_id' => $request->user()->id, 'status' => 'pending']
        ));

        if ($categories) {
            $school->categories()->attach($categories);
        }

        return new AutoSchoolResource($school->load('categories'));
    }

    public function update(UpdateAutoSchoolRequest $request, AutoSchool $autoSchool): AutoSchoolResource
    {
        $validated = $request->validated();
        $categories = $validated['categories'] ?? null;

        $autoSchool->update(collect($validated)->except('categories')->toArray());

        if ($categories !== null) {
            $autoSchool->categories()->sync($categories);
        }

        return new AutoSchoolResource($autoSchool->load('categories'));
    }

    public function destroy(AutoSchool $autoSchool): \Illuminate\Http\Response
    {
        $this->authorize('delete', $autoSchool);
        $autoSchool->delete();

        return response()->noContent();
    }
}
