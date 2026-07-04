<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmNote extends Model
{
    protected $table = 'crm_notes';

    protected $fillable = ['prospect_id', 'created_by', 'content', 'type', 'is_pinned'];

    protected $casts = ['is_pinned' => 'boolean'];

    public function prospect(): BelongsTo { return $this->belongsTo(CrmProspect::class, 'prospect_id'); }
    public function author(): BelongsTo  { return $this->belongsTo(User::class, 'created_by'); }
}
