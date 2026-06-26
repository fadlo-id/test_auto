<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsMonthStat extends Model
{
    protected $table = 'analytics_monthly_stats';
    
    protected $fillable = [
        'auto_school_id',
        'year',
        'month',
        'total_views',
        'unique_visitors',
        'phone_clicks',
        'whatsapp_clicks',
        'website_clicks',
        'facebook_clicks',
        'instagram_clicks',
        'email_clicks',
        'maps_clicks',
        'total_clicks',
        'new_leads',
        'converted_leads',
        'ctr',
        'conversion_rate',
    ];

    public function autoSchool(): BelongsTo
    {
        return $this->belongsTo(AutoSchool::class);
    }

    /**
     * Scope to get stats for a school
     */
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('auto_school_id', $schoolId);
    }

    /**
     * Scope to get stats for a specific year
     */
    public function scopeForYear($query, $year)
    {
        return $query->where('year', $year);
    }

    /**
     * Scope to get stats for a specific month
     */
    public function scopeForMonth($query, $year, $month)
    {
        return $query->where('year', $year)->where('month', $month);
    }

    /**
     * Get click breakdown
     */
    public function getClickBreakdown()
    {
        return [
            'phone' => $this->phone_clicks,
            'whatsapp' => $this->whatsapp_clicks,
            'website' => $this->website_clicks,
            'facebook' => $this->facebook_clicks,
            'instagram' => $this->instagram_clicks,
            'email' => $this->email_clicks,
            'maps' => $this->maps_clicks,
        ];
    }

    /**
     * Get month name
     */
    public function getMonthNameAttribute()
    {
        $months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return $months[$this->month - 1] ?? '';
    }

    /**
     * Get formatted month
     */
    public function getFormattedMonthAttribute()
    {
        return $this->month_name . ' ' . $this->year;
    }

    /**
     * Calculate average daily views
     */
    public function getAvgDailyViewsAttribute()
    {
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $this->month, $this->year);
        return round($this->total_views / $daysInMonth, 2);
    }

    /**
     * Calculate average daily clicks
     */
    public function getAvgDailyClicksAttribute()
    {
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $this->month, $this->year);
        return round($this->total_clicks / $daysInMonth, 2);
    }

    /**
     * Calculate average daily leads
     */
    public function getAvgDailyLeadsAttribute()
    {
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $this->month, $this->year);
        return round($this->new_leads / $daysInMonth, 2);
    }
}
