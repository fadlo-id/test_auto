<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSchoolProfileRequest;
use App\Http\Resources\AutoSchoolResource;
use App\Models\AutoSchool;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SchoolProfileController extends Controller
{
    public function update(UpdateSchoolProfileRequest $request, int $id): AutoSchoolResource|JsonResponse
    {
        $school = AutoSchool::findOrFail($id);

        if (auth()->id() !== $school->user_id && ! auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $school->update($request->validated());

        return new AutoSchoolResource($school->fresh());
    }

    public function uploadLogo(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        $school = AutoSchool::findOrFail($id);

        if (auth()->id() !== $school->user_id && ! auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($school->logo_url) {
            Storage::disk('public')->delete($school->logo_url);
        }

        $path = $request->file('logo')->store('schools/logos', 'public');
        $school->update(['logo_url' => $path]);

        return response()->json(['logo_url' => Storage::url($path)]);
    }

    public function uploadBanner(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'banner' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $school = AutoSchool::findOrFail($id);

        if (auth()->id() !== $school->user_id && ! auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($school->banner_url) {
            Storage::disk('public')->delete($school->banner_url);
        }

        $path = $request->file('banner')->store('schools/banners', 'public');
        $school->update(['banner_url' => $path]);

        return response()->json(['banner_url' => Storage::url($path)]);
    }
}
