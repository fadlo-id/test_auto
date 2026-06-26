<?php

namespace App\Http\Controllers\Api;

use App\Models\AutoSchool;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSchoolRequest;
use Illuminate\Http\Request;

class AdminSchoolsController extends Controller
{
    public function index()
    {
        $schools = AutoSchool::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($schools);
    }

    public function update(string $id, UpdateSchoolRequest $request)
    {
        $school = AutoSchool::findOrFail($id);
        $school->update($request->validated());

        return response()->json([
            'message' => 'School updated successfully',
            'school'  => $school,
        ]);
    }

    public function approve(string $id)
    {
        $school = AutoSchool::findOrFail($id);
        $school->update([
            'status'           => 'approved',
            'rejection_reason' => null,
            'verified_at'      => now(),
        ]);

        return response()->json([
            'message' => 'School approved successfully',
            'school'  => $school,
        ]);
    }

    public function reject(string $id, Request $request)
    {
        $request->validate(['reason' => 'required|string|max:1000']);

        $school = AutoSchool::findOrFail($id);
        $school->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->input('reason'),
        ]);

        return response()->json([
            'message' => 'School rejected successfully',
            'school'  => $school,
        ]);
    }

    public function destroy(string $id)
    {
        $school = AutoSchool::findOrFail($id);
        $school->delete();

        return response()->json(['message' => 'School deleted successfully']);
    }
}
