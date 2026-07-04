<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdsController extends Controller
{
    public function index(Request $request): Response
    {
        $ads = Ad::when($request->search, fn ($q, $s) =>
                $q->where('title', 'like', "%$s%")
            )
            ->when($request->position, fn ($q, $p) => $q->where('position', $p))
            ->when($request->status, function ($q, $s) {
                match ($s) {
                    'active'   => $q->where('is_active', true),
                    'inactive' => $q->where('is_active', false),
                    default    => null,
                };
            })
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($ad) => [
                'id'               => $ad->id,
                'title'            => $ad->title,
                'image_url'        => $ad->image_url,
                'link_url'         => $ad->link_url,
                'position'         => $ad->position,
                'is_active'        => $ad->is_active,
                'is_live'          => $ad->is_live,
                'starts_at'        => $ad->starts_at?->toDateString(),
                'ends_at'          => $ad->ends_at?->toDateString(),
                'clicks_count'     => $ad->clicks_count,
                'impressions_count'=> $ad->impressions_count,
                'notes'            => $ad->notes,
                'created_at'       => $ad->created_at->toDateString(),
            ]);

        return Inertia::render('Admin/Ads', [
            'ads'     => $ads,
            'filters' => $request->only(['search', 'position', 'status']),
            'stats'   => [
                'total'       => Ad::count(),
                'active'      => Ad::where('is_active', true)->count(),
                'total_clicks'=> Ad::sum('clicks_count'),
                'total_views' => Ad::sum('impressions_count'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title'     => 'required|string|max:255',
            'image_url' => 'nullable|url|max:500',
            'link_url'  => 'nullable|url|max:500',
            'position'  => 'required|in:header,sidebar,footer,search,detail',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at'   => 'nullable|date|after_or_equal:starts_at',
            'notes'     => 'nullable|string|max:500',
        ]);

        Ad::create($data);

        return back()->with('success', "Publicité «{$data['title']}» créée.");
    }

    public function update(Request $request, Ad $ad): RedirectResponse
    {
        $data = $request->validate([
            'title'     => 'required|string|max:255',
            'image_url' => 'nullable|url|max:500',
            'link_url'  => 'nullable|url|max:500',
            'position'  => 'required|in:header,sidebar,footer,search,detail',
            'is_active' => 'boolean',
            'starts_at' => 'nullable|date',
            'ends_at'   => 'nullable|date',
            'notes'     => 'nullable|string|max:500',
        ]);

        $ad->update($data);

        return back()->with('success', "Publicité «{$ad->title}» mise à jour.");
    }

    public function destroy(Ad $ad): RedirectResponse
    {
        $title = $ad->title;
        $ad->delete();

        return back()->with('success', "Publicité «{$title}» supprimée.");
    }
}
