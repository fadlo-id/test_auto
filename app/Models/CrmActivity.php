<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmActivity extends Model
{
    protected $table = 'crm_activities';

    protected $fillable = ['prospect_id', 'user_id', 'type', 'description', 'meta', 'occurred_at'];

    protected $casts = [
        'meta'        => 'array',
        'occurred_at' => 'datetime',
    ];

    public function prospect(): BelongsTo { return $this->belongsTo(CrmProspect::class, 'prospect_id'); }
    public function user(): BelongsTo    { return $this->belongsTo(User::class, 'user_id'); }
}
