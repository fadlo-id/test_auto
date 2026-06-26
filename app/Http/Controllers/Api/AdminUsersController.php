<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;

class AdminUsersController extends Controller
{
    public function index()
    {
        $this->authorize('isAdmin');

        $users = User::paginate(20);
        return response()->json($users);
    }

    public function update($id, UpdateUserRequest $request)
    {
        $this->authorize('isAdmin');

        $user = User::findOrFail($id);
        $user->update($request->validated());

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    public function ban($id, Request $request)
    {
        $this->authorize('isAdmin');

        $user = User::findOrFail($id);
        $user->is_banned = $request->input('is_banned', true);
        $user->save();

        return response()->json([
            'message' => $user->is_banned ? 'User banned successfully' : 'User unbanned successfully',
            'user' => $user,
        ]);
    }

    public function destroy($id)
    {
        $this->authorize('isAdmin');

        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
