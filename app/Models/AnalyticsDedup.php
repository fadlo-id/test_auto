<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsDedup extends Model
{
    public $timestamps = false;

    protected $table = 'analytics_dedup';

    protected $fillable = [
        'auto_school_id',
        'visitor_hash',
        'event_type',
        'tracked_date',
    ];

    protected $casts = [
        'tracked_date' => 'date',
        'created_at'   => 'datetime',
    ];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }
}
