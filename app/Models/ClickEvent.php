<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClickEvent extends Model
{
    protected $fillable = [
        'auto_school_id',
        'user_id',
        'click_type',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'country',
        'details',
    ];

    protected $casts = [
        'details' => 'array',
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
     * Scope to get clicks for a school
     */
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('auto_school_id', $schoolId);
    }

    /**
     * Scope to get clicks of a specific type
     */
    public function scopeByType($query, $clickType)
    {
        return $query->where('click_type', $clickType);
    }

    /**
     * Scope to get clicks in a date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get click counts by type
     */
    public static function getClicksByType($schoolId, $startDate = null, $endDate = null)
    {
        $query = self::forSchool($schoolId);

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        return $query->groupBy('click_type')
            ->selectRaw('click_type, COUNT(*) as count')
            ->get()
            ->mapWithKeys(fn($item) => [$item->click_type => $item->count])
            ->toArray();
    }

    /**
     * Get top click types
     */
    public static function getTopClickTypes($schoolId, $limit = 5, $startDate = null, $endDate = null)
    {
        $query = self::forSchool($schoolId);

        if ($startDate && $endDate) {
            $query->dateRange($startDate, $endDate);
        }

        return $query->groupBy('click_type')
            ->selectRaw('click_type, COUNT(*) as count')
            ->orderByRaw('count DESC')
            ->limit($limit)
            ->get();
    }
}
