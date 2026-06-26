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
        $this->authorize('isAdmin');

        $schools = AutoSchool::with('user')->paginate(20);
        return response()->json($schools);
    }

    public function update($id, UpdateSchoolRequest $request)
    {
        $this->authorize('isAdmin');

        $school = AutoSchool::findOrFail($id);
        $school->update($request->validated());

        return response()->json([
            'message' => 'School updated successfully',
            'school' => $school,
        ]);
    }

    public function approve($id)
    {
        $this->authorize('isAdmin');

        $school = AutoSchool::findOrFail($id);
        $school->update(['status' => 'approved']);

        return response()->json([
            'message' => 'School approved successfully',
            'school' => $school,
        ]);
    }

    public function reject($id, Request $request)
    {
        $this->authorize('isAdmin');

        $request->validate(['reason' => 'required|string']);

        $school = AutoSchool::findOrFail($id);
        $school->update([
            'status' => 'rejected',
            'rejection_reason' => $request->input('reason'),
        ]);

        return response()->json([
            'message' => 'School rejected successfully',
            'school' => $school,
        ]);
    }

    public function destroy($id)
    {
        $this->authorize('isAdmin');

        $school = AutoSchool::findOrFail($id);
        $school->delete();

        return response()->json(['message' => 'School deleted successfully']);
    }
}
