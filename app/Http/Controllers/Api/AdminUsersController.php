<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use Illuminate\Http\Request;

class AdminUsersController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }

    public function update(string $id, UpdateUserRequest $request)
    {
        $user = User::findOrFail($id);
        $user->update($request->validated());

        return response()->json([
            'message' => 'User updated successfully',
            'user'    => $user,
        ]);
    }

    public function ban(string $id, Request $request)
    {
        $user = User::findOrFail($id);

        // Ban = désactiver le compte (is_active false)
        $ban = (bool) $request->input('ban', true);
        $user->update(['is_active' => ! $ban]);

        return response()->json([
            'message' => $ban ? 'User banned successfully' : 'User unbanned successfully',
            'user'    => $user,
        ]);
    }

    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
