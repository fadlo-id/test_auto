<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrmProspect extends Model
{
    use SoftDeletes;

    protected $table = 'crm_prospects';

    protected $fillable = [
        'name', 'email', 'phone', 'city', 'company',
        'source', 'stage_id', 'assigned_to', 'status',
        'score', 'description', 'last_contact_at',
    ];

    protected $casts = [
        'last_contact_at' => 'datetime',
        'score'           => 'integer',
    ];

    // ── Relations ────────────────────────────────────────────────────────────

    public function stage(): BelongsTo
    {
        return $this->belongsTo(CrmPipelineStage::class, 'stage_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(CrmTag::class, 'crm_prospect_tags', 'prospect_id', 'tag_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(CrmNote::class, 'prospect_id')->orderByDesc('is_pinned')->orderByDesc('created_at');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(CrmActivity::class, 'prospect_id')->orderByDesc('occurred_at');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(CrmReminder::class, 'prospect_id')->orderBy('due_at');
    }

    public function emails(): HasMany
    {
        return $this->hasMany(CrmEmail::class, 'prospect_id')->orderByDesc('sent_at');
    }

    public function sms(): HasMany
    {
        return $this->hasMany(CrmSms::class, 'prospect_id')->orderByDesc('sent_at');
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public function isWon(): bool      { return $this->status === 'won'; }
    public function isLost(): bool     { return $this->status === 'lost'; }
    public function isArchived(): bool { return $this->status === 'archived'; }

    public function pendingRemindersCount(): int
    {
        return $this->reminders()->where('status', 'pending')->count();
    }
}
