<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmPipelineStage;
use App\Models\CrmProspect;
use App\Services\CrmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CrmPipelineController extends Controller
{
    public function __construct(private CrmService $crm) {}

    public function index(Request $request): Response
    {
        $stages = CrmPipelineStage::orderBy('order')
            ->with(['prospects' => function ($q) use ($request) {
                $q->with(['assignedTo', 'tags'])
                  ->withCount(['notes', 'reminders' => fn ($q2) => $q2->where('status', 'pending')]);

                if ($assigned = $request->input('assigned_to')) {
                    $q->where('assigned_to', $assigned);
                }
                if ($search = $request->input('search')) {
                    $q->where(fn ($q2) => $q2
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('company', 'like', "%{$search}%")
                    );
                }
            }])
            ->get()
            ->map(fn ($stage) => [
                'id'         => $stage->id,
                'name'       => $stage->name,
                'color'      => $stage->color,
                'order'      => $stage->order,
                'type'       => $stage->type,
                'prospects'  => $stage->prospects->map(fn ($p) => [
                    'id'              => $p->id,
                    'name'            => $p->name,
                    'email'           => $p->email,
                    'phone'           => $p->phone,
                    'company'         => $p->company,
                    'source'          => $p->source,
                    'score'           => $p->score,
                    'status'          => $p->status,
                    'last_contact_at' => $p->last_contact_at,
                    'created_at'      => $p->created_at,
                    'notes_count'     => $p->notes_count,
                    'reminders_count' => $p->reminders_count,
                    'assigned_to'     => $p->assignedTo ? ['id' => $p->assignedTo->id, 'name' => $p->assignedTo->name] : null,
                    'tags'            => $p->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color]),
                ]),
            ]);

        return Inertia::render('Admin/CRM/Pipeline', [
            'stages'  => $stages,
            'filters' => $request->only(['search', 'assigned_to']),
            'admins'  => \App\Models\User::whereIn('role', ['admin', 'super_admin'])->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function move(Request $request): RedirectResponse
    {
        $request->validate([
            'prospect_id' => 'required|exists:crm_prospects,id',
            'stage_id'    => 'required|exists:crm_pipeline_stages,id',
        ]);

        $prospect = CrmProspect::findOrFail($request->integer('prospect_id'));
        $this->crm->moveStage($prospect, $request->integer('stage_id'));

        return back()->with('success', 'Prospect déplacé.');
    }

    // Stage CRUD
    public function storeStage(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:80',
            'color' => 'required|regex:/^#[0-9a-fA-F]{6}$/',
            'type'  => 'required|in:active,won,lost',
        ]);

        $maxOrder = CrmPipelineStage::max('order') ?? 0;
        CrmPipelineStage::create([...$data, 'order' => $maxOrder + 1]);

        return back()->with('success', 'Étape créée.');
    }

    public function updateStage(Request $request, CrmPipelineStage $stage): RedirectResponse
    {
        $data = $request->validate([
            'name'  => 'required|string|max:80',
            'color' => 'required|regex:/^#[0-9a-fA-F]{6}$/',
        ]);

        $stage->update($data);
        return back()->with('success', 'Étape mise à jour.');
    }

    public function destroyStage(CrmPipelineStage $stage): RedirectResponse
    {
        if ($stage->prospects()->exists()) {
            return back()->with('error', 'Impossible de supprimer une étape contenant des prospects.');
        }

        $stage->delete();
        return back()->with('success', 'Étape supprimée.');
    }

    public function reorderStages(Request $request): RedirectResponse
    {
        $request->validate(['order' => 'required|array', 'order.*' => 'integer|exists:crm_pipeline_stages,id']);

        foreach ($request->input('order') as $index => $id) {
            CrmPipelineStage::where('id', $id)->update(['order' => $index + 1]);
        }

        return back()->with('success', 'Ordre mis à jour.');
    }
}
