<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadEvent extends Model
{
    protected $fillable = [
        'auto_school_id',
        'user_id',
        'visitor_name',
        'visitor_email',
        'visitor_phone',
        'visitor_message',
        'referrer_url',
        'ip_address',
        'device_type',
        'status',
    ];

    public function autoSchool(): BelongsTo
    {
        return $this->belongsTo(AutoSchool::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get leads for a school
     */
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('auto_school_id', $schoolId);
    }

    /**
     * Scope to get leads by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get new leads
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope to get converted leads
     */
    public function scopeConverted($query)
    {
        return $query->where('status', 'converted');
    }

    /**
     * Scope to get leads in a date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Mark lead as contacted
     */
    public function markContacted()
    {
        $this->update(['status' => 'contacted']);
        return $this;
    }

    /**
     * Mark lead as converted
     */
    public function markConverted()
    {
        $this->update(['status' => 'converted']);
        return $this;
    }

    /**
     * Archive lead
     */
    public function archive()
    {
        $this->update(['status' => 'archived']);
        return $this;
    }
}
