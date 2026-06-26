<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSchoolProfileRequest;
use App\Models\AutoSchool;
use Illuminate\Http\Request;

class SchoolProfileController extends Controller
{
    /**
     * Update school profile
     * PUT /api/v1/school/{id}/profile
     */
    public function update(UpdateSchoolProfileRequest $request, $id)
    {
        $school = AutoSchool::findOrFail($id);

        // Check authorization
        if (auth()->user()->id !== $school->user_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $school->update($request->validated());

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $school,
        ]);
    }

    /**
     * Upload logo
     * POST /api/v1/school/{id}/upload-logo
     */
    public function uploadLogo(Request $request, $id)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $school = AutoSchool::findOrFail($id);

        // Check authorization
        if (auth()->user()->id !== $school->user_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete old logo
        if ($school->logo) {
            \Storage::disk('public')->delete($school->logo);
        }

        // Store new logo
        $path = $request->file('logo')->store('schools/logos', 'public');
        $school->update(['logo' => $path]);

        return response()->json([
            'message' => 'Logo uploaded successfully',
            'data' => ['logo' => $school->logo],
        ]);
    }

    /**
     * Upload banner
     * POST /api/v1/school/{id}/upload-banner
     */
    public function uploadBanner(Request $request, $id)
    {
        $request->validate([
            'banner' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $school = AutoSchool::findOrFail($id);

        // Check authorization
        if (auth()->user()->id !== $school->user_id && !auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete old banner
        if ($school->banner) {
            \Storage::disk('public')->delete($school->banner);
        }

        // Store new banner
        $path = $request->file('banner')->store('schools/banners', 'public');
        $school->update(['banner' => $path]);

        return response()->json([
            'message' => 'Banner uploaded successfully',
            'data' => ['banner' => $school->banner],
        ]);
    }
}
