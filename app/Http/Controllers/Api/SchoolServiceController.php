<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\AutoSchool;
use App\Models\Service;
use Illuminate\Http\Request;

class SchoolServiceController extends Controller
{
    /**
     * Get all services for a school
     * GET /api/v1/school/{schoolId}/services
     */
    public function index($schoolId)
    {
        $school = AutoSchool::findOrFail($schoolId);
        $services = $school->services()->get();

        return response()->json($services);
    }

    /**
     * Create a new service
     * POST /api/v1/school/{schoolId}/services
     */
    public function store(StoreServiceRequest $request, $schoolId)
    {
        $school = AutoSchool::findOrFail($schoolId);

        // Check authorization
        if (auth()->user()->id !== $school->user_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service = $school->services()->create($request->validated());

        return response()->json([
            'message' => 'Service created successfully',
            'data' => $service,
        ], 201);
    }

    /**
     * Get a specific service
     * GET /api/v1/school/{schoolId}/services/{id}
     */
    public function show($schoolId, $id)
    {
        $school = AutoSchool::findOrFail($schoolId);
        $service = $school->services()->findOrFail($id);

        return response()->json($service);
    }

    /**
     * Update a service
     * PUT /api/v1/school/{schoolId}/services/{id}
     */
    public function update(UpdateServiceRequest $request, $schoolId, $id)
    {
        $school = AutoSchool::findOrFail($schoolId);

        // Check authorization
        if (auth()->user()->id !== $school->user_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service = $school->services()->findOrFail($id);
        $service->update($request->validated());

        return response()->json([
            'message' => 'Service updated successfully',
            'data' => $service,
        ]);
    }

    /**
     * Delete a service
     * DELETE /api/v1/school/{schoolId}/services/{id}
     */
    public function destroy($schoolId, $id)
    {
        $school = AutoSchool::findOrFail($schoolId);

        // Check authorization
        if (auth()->user()->id !== $school->user_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service = $school->services()->findOrFail($id);
        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully',
        ]);
    }
}
