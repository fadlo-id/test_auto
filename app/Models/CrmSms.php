<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrmSms extends Model
{
    protected $table = 'crm_sms';

    protected $fillable = [
        'prospect_id', 'sent_by', 'to_phone', 'message',
        'status', 'provider_id', 'error_message', 'sent_at',
    ];

    protected $casts = ['sent_at' => 'datetime'];

    public function prospect(): BelongsTo { return $this->belongsTo(CrmProspect::class, 'prospect_id'); }
    public function sentBy(): BelongsTo  { return $this->belongsTo(User::class, 'sent_by'); }
}
