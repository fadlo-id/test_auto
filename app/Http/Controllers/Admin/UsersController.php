<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UsersController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%"))
            ->when($request->role, fn ($q, $r) => $q->where('role', $r))
            ->when($request->status === 'active',   fn ($q) => $q->where('is_active', true)->where('status', 0))
            ->when($request->status === 'inactive', fn ($q) => $q->where('is_active', false)->where('status', 0))
            ->when($request->status === 'banned',   fn ($q) => $q->where('status', 1))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Users', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role', 'status']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return back()->with('error', 'Impossible de modifier un administrateur.');
        }

        $user->update($request->validated());

        return back()->with('success', 'Utilisateur mis à jour.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return back()->with('error', 'Impossible de supprimer un administrateur.');
        }

        $user->delete();

        return back()->with('success', 'Utilisateur supprimé.');
    }

    public function activate(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return back()->with('error', 'Impossible de modifier le statut d\'un administrateur.');
        }

        $user->update(['is_active' => true, 'status' => 0]);

        return back()->with('success', 'Compte activé.');
    }

    public function deactivate(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return back()->with('error', 'Impossible de modifier le statut d\'un administrateur.');
        }

        $user->update(['is_active' => false, 'status' => 0]);

        return back()->with('success', 'Compte désactivé.');
    }

    public function ban(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return back()->with('error', 'Impossible de bannir un administrateur.');
        }

        $user->update(['is_active' => false, 'status' => 1]);

        return back()->with('success', 'Compte banni.');
    }

    public function unban(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return back()->with('error', 'Impossible de modifier le statut d\'un administrateur.');
        }

        $user->update(['is_active' => true, 'status' => 0]);

        return back()->with('success', 'Bannissement levé — compte réactivé.');
    }

    public function export(Request $request): StreamedResponse
    {
        $query = User::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%$s%")->orWhere('email', 'like', "%$s%"))
            ->when($request->role,   fn ($q, $r) => $q->where('role', $r))
            ->when($request->status === 'active',   fn ($q) => $q->where('is_active', true)->where('status', 0))
            ->when($request->status === 'inactive', fn ($q) => $q->where('is_active', false)->where('status', 0))
            ->when($request->status === 'banned',   fn ($q) => $q->where('status', 1))
            ->latest()
            ->select(['id', 'name', 'email', 'role', 'is_active', 'status', 'created_at']);

        $filename = 'utilisateurs_' . now()->format('Ymd') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel
            fputcsv($handle, ['ID', 'Nom', 'Email', 'Rôle', 'Statut', 'Date inscription']);

            $query->chunk(500, function ($users) use ($handle) {
                foreach ($users as $u) {
                    fputcsv($handle, [
                        $u->id,
                        $u->name,
                        $u->email,
                        $u->role,
                        $u->status === 1 ? 'Banni' : ($u->is_active ? 'Actif' : 'Désactivé'),
                        $u->created_at?->format('d/m/Y'),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
