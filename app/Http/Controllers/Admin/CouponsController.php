<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CouponsController extends Controller
{
    public function index(Request $request): Response
    {
        $coupons = Coupon::when($request->search, fn ($q, $s) =>
                $q->where('code', 'like', "%$s%")->orWhere('description', 'like', "%$s%")
            )
            ->when($request->status, function ($q, $s) {
                match ($s) {
                    'active'   => $q->where('is_active', true),
                    'inactive' => $q->where('is_active', false),
                    'expired'  => $q->where('expires_at', '<', now()),
                    default    => null,
                };
            })
            ->latest()
            ->paginate(25)
            ->withQueryString()
            ->through(fn ($c) => [
                'id'             => $c->id,
                'code'           => $c->code,
                'discount_type'  => $c->discount_type,
                'discount_value' => $c->discount_value,
                'min_amount'     => $c->min_amount,
                'max_uses'       => $c->max_uses,
                'used_count'     => $c->used_count,
                'expires_at'     => $c->expires_at?->toDateString(),
                'is_active'      => $c->is_active,
                'is_expired'     => $c->is_expired,
                'is_exhausted'   => $c->is_exhausted,
                'description'    => $c->description,
                'created_at'     => $c->created_at->toDateString(),
            ]);

        return Inertia::render('Admin/Coupons', [
            'coupons' => $coupons,
            'filters' => $request->only(['search', 'status']),
            'stats'   => [
                'total'    => Coupon::count(),
                'active'   => Coupon::where('is_active', true)->count(),
                'expired'  => Coupon::where('expires_at', '<', now())->count(),
                'total_uses' => Coupon::sum('used_count'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code'           => 'required|string|max:50|unique:coupons,code',
            'discount_type'  => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0|max:100',
            'min_amount'     => 'nullable|numeric|min:0',
            'max_uses'       => 'nullable|integer|min:1',
            'expires_at'     => 'nullable|date|after:today',
            'is_active'      => 'boolean',
            'description'    => 'nullable|string|max:255',
        ]);

        $data['code'] = strtoupper($data['code']);
        Coupon::create($data);

        return back()->with('success', "Coupon «{$data['code']}» créé.");
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $data = $request->validate([
            'code'           => 'required|string|max:50|unique:coupons,code,' . $coupon->id,
            'discount_type'  => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0|max:100',
            'min_amount'     => 'nullable|numeric|min:0',
            'max_uses'       => 'nullable|integer|min:1',
            'expires_at'     => 'nullable|date',
            'is_active'      => 'boolean',
            'description'    => 'nullable|string|max:255',
        ]);

        $data['code'] = strtoupper($data['code']);
        $coupon->update($data);

        return back()->with('success', "Coupon «{$coupon->code}» mis à jour.");
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $code = $coupon->code;
        $coupon->delete();

        return back()->with('success', "Coupon «{$code}» supprimé.");
    }

    public function generate(): RedirectResponse
    {
        $code = strtoupper(Str::random(8));
        Coupon::create([
            'code'           => $code,
            'discount_type'  => 'percent',
            'discount_value' => 10,
            'is_active'      => true,
        ]);

        return back()->with('success', "Coupon généré : {$code}");
    }
}
