<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmEmail extends Model
{
    protected $table = 'crm_emails';

    protected $fillable = [
        'prospect_id', 'sent_by', 'to_email', 'subject',
        'body', 'status', 'error_message', 'sent_at',
    ];

    protected $casts = ['sent_at' => 'datetime'];

    public function prospect(): BelongsTo { return $this->belongsTo(CrmProspect::class, 'prospect_id'); }
    public function sentBy(): BelongsTo  { return $this->belongsTo(User::class, 'sent_by'); }
}
