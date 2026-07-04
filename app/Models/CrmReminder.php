<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmReminder extends Model
{
    protected $table = 'crm_reminders';

    protected $fillable = [
        'prospect_id', 'assigned_to', 'created_by',
        'title', 'note', 'due_at', 'status', 'done_at', 'notified_at',
    ];

    protected $casts = [
        'due_at'      => 'datetime',
        'done_at'     => 'datetime',
        'notified_at' => 'datetime',
    ];

    public function prospect(): BelongsTo    { return $this->belongsTo(CrmProspect::class, 'prospect_id'); }
    public function assignedTo(): BelongsTo  { return $this->belongsTo(User::class, 'assigned_to'); }
    public function createdBy(): BelongsTo   { return $this->belongsTo(User::class, 'created_by'); }

    public function isPending(): bool    { return $this->status === 'pending'; }
    public function isDone(): bool       { return $this->status === 'done'; }
    public function isOverdue(): bool    { return $this->isPending() && $this->due_at->isPast(); }
    public function isDueToday(): bool   { return $this->isPending() && $this->due_at->isToday(); }
}
