<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ViewEvent extends Model
{
    protected $fillable = [
        'auto_school_id',
        'user_id',
        'ip_address',
        'user_agent',
        'referrer_url',
        'device_type',
        'browser',
        'operating_system',
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
     * Scope to get views for a date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope to get views for a school
     */
    public function scopeForSchool($query, $schoolId)
    {
        return $query->where('auto_school_id', $schoolId);
    }

    /**
     * Scope to get views by device type
     */
    public function scopeByDeviceType($query, $deviceType)
    {
        return $query->where('device_type', $deviceType);
    }

    /**
     * Get device type from user agent
     */
    public static function detectDeviceType($userAgent)
    {
        $ua = strtolower($userAgent);
        
        if (strpos($ua, 'mobile') !== false || strpos($ua, 'android') !== false) {
            return 'mobile';
        } elseif (strpos($ua, 'tablet') !== false || strpos($ua, 'ipad') !== false) {
            return 'tablet';
        }
        
        return 'desktop';
    }

    /**
     * Get browser from user agent
     */
    public static function detectBrowser($userAgent)
    {
        $ua = strtolower($userAgent);
        
        if (strpos($ua, 'firefox') !== false) return 'Firefox';
        if (strpos($ua, 'safari') !== false && strpos($ua, 'chrome') === false) return 'Safari';
        if (strpos($ua, 'chrome') !== false) return 'Chrome';
        if (strpos($ua, 'edge') !== false) return 'Edge';
        if (strpos($ua, 'trident') !== false) return 'IE';
        
        return 'Other';
    }

    /**
     * Get OS from user agent
     */
    public static function detectOS($userAgent)
    {
        $ua = strtolower($userAgent);
        
        if (strpos($ua, 'windows') !== false) return 'Windows';
        if (strpos($ua, 'mac') !== false) return 'macOS';
        if (strpos($ua, 'linux') !== false) return 'Linux';
        if (strpos($ua, 'android') !== false) return 'Android';
        if (strpos($ua, 'iphone') !== false || strpos($ua, 'ipad') !== false) return 'iOS';
        
        return 'Other';
    }
}
