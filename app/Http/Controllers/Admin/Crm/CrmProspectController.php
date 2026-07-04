<?php

namespace App\Http\Controllers\Admin\Crm;

use App\Http\Controllers\Controller;
use App\Models\CrmPipelineStage;
use App\Models\CrmProspect;
use App\Models\CrmTag;
use App\Models\User;
use App\Services\CrmService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CrmProspectController extends Controller
{
    public function __construct(private CrmService $crm) {}

    public function index(Request $request): Response
    {
        $query = CrmProspect::with(['stage', 'assignedTo', 'tags'])
            ->withCount(['notes', 'reminders' => fn ($q) => $q->where('status', 'pending')]);

        // Filters
        if ($s = $request->input('search')) {
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%")
                ->orWhere('phone', 'like', "%{$s}%")
                ->orWhere('company', 'like', "%{$s}%")
            );
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($stageId = $request->input('stage_id')) {
            $query->where('stage_id', $stageId);
        }

        if ($assignedTo = $request->input('assigned_to')) {
            $query->where('assigned_to', $assignedTo);
        }

        if ($source = $request->input('source')) {
            $query->where('source', $source);
        }

        if ($tagId = $request->input('tag_id')) {
            $query->whereHas('tags', fn ($q) => $q->where('crm_tags.id', $tagId));
        }

        $sort  = $request->input('sort', 'created_at');
        $dir   = $request->input('dir', 'desc');
        $allowed = ['created_at', 'name', 'last_contact_at', 'score', 'status'];
        if (in_array($sort, $allowed)) {
            $query->orderBy($sort, $dir === 'asc' ? 'asc' : 'desc');
        }

        $prospects = $query->paginate(20)->withQueryString()->through(fn ($p) => [
            'id'               => $p->id,
            'name'             => $p->name,
            'email'            => $p->email,
            'phone'            => $p->phone,
            'city'             => $p->city,
            'company'          => $p->company,
            'source'           => $p->source,
            'status'           => $p->status,
            'score'            => $p->score,
            'last_contact_at'  => $p->last_contact_at,
            'created_at'       => $p->created_at,
            'notes_count'      => $p->notes_count,
            'reminders_count'  => $p->reminders_count,
            'stage'            => $p->stage ? ['id' => $p->stage->id, 'name' => $p->stage->name, 'color' => $p->stage->color] : null,
            'assigned_to'      => $p->assignedTo ? ['id' => $p->assignedTo->id, 'name' => $p->assignedTo->name] : null,
            'tags'             => $p->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color]),
        ]);

        return Inertia::render('Admin/CRM/Prospects/Index', [
            'prospects' => $prospects,
            'filters'   => $request->only(['search', 'status', 'stage_id', 'assigned_to', 'source', 'tag_id', 'sort', 'dir']),
            'stages'    => CrmPipelineStage::orderBy('order')->get(['id', 'name', 'color']),
            'tags'      => CrmTag::orderBy('name')->get(['id', 'name', 'color']),
            'admins'    => User::whereIn('role', ['admin', 'super_admin'])->orderBy('name')->get(['id', 'name']),
            'sources'   => ['website', 'referral', 'social', 'direct', 'event', 'other'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'email'       => 'nullable|email|max:150',
            'phone'       => 'nullable|string|max:30',
            'city'        => 'nullable|string|max:100',
            'company'     => 'nullable|string|max:150',
            'source'      => 'nullable|string|max:50',
            'stage_id'    => 'nullable|exists:crm_pipeline_stages,id',
            'assigned_to' => 'nullable|exists:users,id',
            'description' => 'nullable|string|max:2000',
            'score'       => 'nullable|integer|min:0|max:100',
            'tag_ids'     => 'nullable|array',
            'tag_ids.*'   => 'exists:crm_tags,id',
        ]);

        $tagIds = $data['tag_ids'] ?? [];
        unset($data['tag_ids']);

        // Default to first stage if none provided
        if (empty($data['stage_id'])) {
            $data['stage_id'] = CrmPipelineStage::where('is_default', true)->value('id')
                ?? CrmPipelineStage::orderBy('order')->value('id');
        }

        $prospect = CrmProspect::create($data);

        if ($tagIds) {
            $prospect->tags()->sync($tagIds);
        }

        $this->crm->log($prospect, 'created', "Prospect créé : {$prospect->name}");

        return back()->with('success', 'Prospect créé avec succès.');
    }

    public function show(CrmProspect $prospect): Response
    {
        $prospect->load([
            'stage', 'assignedTo', 'tags',
            'notes.author',
            'activities.user',
            'reminders.assignedTo',
            'reminders.createdBy',
            'emails.sentBy',
            'sms.sentBy',
        ]);

        return Inertia::render('Admin/CRM/Prospects/Show', [
            'prospect' => [
                'id'              => $prospect->id,
                'name'            => $prospect->name,
                'email'           => $prospect->email,
                'phone'           => $prospect->phone,
                'city'            => $prospect->city,
                'company'         => $prospect->company,
                'source'          => $prospect->source,
                'status'          => $prospect->status,
                'score'           => $prospect->score,
                'description'     => $prospect->description,
                'last_contact_at' => $prospect->last_contact_at,
                'created_at'      => $prospect->created_at,
                'updated_at'      => $prospect->updated_at,
                'stage'           => $prospect->stage ? [
                    'id' => $prospect->stage->id, 'name' => $prospect->stage->name, 'color' => $prospect->stage->color,
                ] : null,
                'assigned_to'     => $prospect->assignedTo ? [
                    'id' => $prospect->assignedTo->id, 'name' => $prospect->assignedTo->name,
                ] : null,
                'tags'            => $prospect->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color]),
                'notes'           => $prospect->notes->map(fn ($n) => [
                    'id'        => $n->id,
                    'content'   => $n->content,
                    'type'      => $n->type,
                    'is_pinned' => $n->is_pinned,
                    'author'    => ['name' => $n->author?->name],
                    'created_at'=> $n->created_at,
                ]),
                'activities'      => $prospect->activities->map(fn ($a) => [
                    'id'          => $a->id,
                    'type'        => $a->type,
                    'description' => $a->description,
                    'meta'        => $a->meta,
                    'user'        => ['name' => $a->user?->name],
                    'occurred_at' => $a->occurred_at,
                ]),
                'reminders'       => $prospect->reminders->map(fn ($r) => [
                    'id'          => $r->id,
                    'title'       => $r->title,
                    'note'        => $r->note,
                    'due_at'      => $r->due_at,
                    'status'      => $r->status,
                    'done_at'     => $r->done_at,
                    'is_overdue'  => $r->isOverdue(),
                    'assigned_to' => ['id' => $r->assignedTo?->id, 'name' => $r->assignedTo?->name],
                    'created_by'  => ['name' => $r->createdBy?->name],
                ]),
                'emails'          => $prospect->emails->map(fn ($e) => [
                    'id'        => $e->id,
                    'to_email'  => $e->to_email,
                    'subject'   => $e->subject,
                    'body'      => $e->body,
                    'status'    => $e->status,
                    'sent_at'   => $e->sent_at,
                    'sent_by'   => ['name' => $e->sentBy?->name],
                ]),
                'sms'             => $prospect->sms->map(fn ($s) => [
                    'id'        => $s->id,
                    'to_phone'  => $s->to_phone,
                    'message'   => $s->message,
                    'status'    => $s->status,
                    'sent_at'   => $s->sent_at,
                    'sent_by'   => ['name' => $s->sentBy?->name],
                ]),
            ],
            'stages' => CrmPipelineStage::orderBy('order')->get(['id', 'name', 'color', 'type']),
            'tags'   => CrmTag::orderBy('name')->get(['id', 'name', 'color']),
            'admins' => User::whereIn('role', ['admin', 'super_admin'])->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, CrmProspect $prospect): RedirectResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'email'       => 'nullable|email|max:150',
            'phone'       => 'nullable|string|max:30',
            'city'        => 'nullable|string|max:100',
            'company'     => 'nullable|string|max:150',
            'source'      => 'nullable|string|max:50',
            'description' => 'nullable|string|max:2000',
            'score'       => 'nullable|integer|min:0|max:100',
            'status'      => 'nullable|in:active,won,lost,archived',
            'tag_ids'     => 'nullable|array',
            'tag_ids.*'   => 'exists:crm_tags,id',
        ]);

        $tagIds = $data['tag_ids'] ?? null;
        unset($data['tag_ids']);

        $prospect->update($data);

        if ($tagIds !== null) {
            $prospect->tags()->sync($tagIds);
        }

        $this->crm->log($prospect, 'updated', "Informations mises à jour");

        return back()->with('success', 'Prospect mis à jour.');
    }

    public function destroy(CrmProspect $prospect): RedirectResponse
    {
        $prospect->delete();
        return redirect()->route('admin.crm.prospects.index')->with('success', 'Prospect archivé.');
    }

    public function moveStage(Request $request, CrmProspect $prospect): RedirectResponse
    {
        $request->validate(['stage_id' => 'required|exists:crm_pipeline_stages,id']);
        $this->crm->moveStage($prospect, $request->integer('stage_id'));
        return back()->with('success', 'Étape mise à jour.');
    }

    public function assign(Request $request, CrmProspect $prospect): RedirectResponse
    {
        $request->validate(['assigned_to' => 'nullable|exists:users,id']);
        $this->crm->assign($prospect, $request->integer('assigned_to'));
        return back()->with('success', 'Prospect assigné.');
    }
}
