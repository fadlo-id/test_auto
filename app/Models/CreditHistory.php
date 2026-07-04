<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'auto_school_id', 'action', 'credit_type',
        'views_change', 'clicks_change',
        'views_before', 'views_after',
        'clicks_before', 'clicks_after',
        'performed_by', 'reason', 'ip', 'created_at',
    ];

    protected $casts = [
        'views_change'  => 'integer',
        'clicks_change' => 'integer',
        'views_before'  => 'integer',
        'views_after'   => 'integer',
        'clicks_before' => 'integer',
        'clicks_after'  => 'integer',
        'created_at'    => 'datetime',
    ];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }

    public function performer()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
