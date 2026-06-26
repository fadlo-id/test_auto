<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsDailyStat extends Model
{
    protected $fillable = [
        'auto_school_id',
        'date',
        'total_views',
        'unique_visitors',
        'returning_visitors',
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
        'desktop_views',
        'mobile_views',
        'tablet_views',
        'direct_traffic',
        'organic_traffic',
        'referral_traffic',
        'paid_traffic',
    ];

    protected $casts = [
        'date' => 'date',
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
     * Scope to get stats for a date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Get CTR (Click-Through Rate)
     */
    public function getCtrAttribute()
    {
        return $this->total_views > 0 ? round(($this->total_clicks / $this->total_views) * 100, 2) : 0;
    }

    /**
     * Get conversion rate (leads / views)
     */
    public function getConversionRateAttribute()
    {
        return $this->total_views > 0 ? round(($this->new_leads / $this->total_views) * 100, 2) : 0;
    }

    /**
     * Get engagement rate
     */
    public function getEngagementRateAttribute()
    {
        return $this->unique_visitors > 0 ? round((($this->total_clicks + $this->new_leads) / $this->unique_visitors) * 100, 2) : 0;
    }

    /**
     * Get lead cost (subscription cost / leads)
     */
    public function getLeadCostAttribute()
    {
        $school = $this->autoSchool;
        $subscription = $school?->subscription;
        
        if (!$subscription || $this->new_leads === 0) {
            return 0;
        }

        $plan = $subscription->plan;
        return round($plan->price / $this->new_leads, 2);
    }

    /**
     * Get total click types breakdown
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
     * Get device breakdown
     */
    public function getDeviceBreakdown()
    {
        return [
            'desktop' => $this->desktop_views,
            'mobile' => $this->mobile_views,
            'tablet' => $this->tablet_views,
        ];
    }

    /**
     * Get traffic sources breakdown
     */
    public function getTrafficBreakdown()
    {
        return [
            'direct' => $this->direct_traffic,
            'organic' => $this->organic_traffic,
            'referral' => $this->referral_traffic,
            'paid' => $this->paid_traffic,
        ];
    }
}
