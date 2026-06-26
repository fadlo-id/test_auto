<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsSetting extends Model
{
    protected $fillable = [
        'auto_school_id',
        'tracking_enabled',
        'collect_device_info',
        'collect_referrer',
        'collect_browser_info',
        'data_retention_days',
        'auto_delete_old_data',
    ];

    protected $casts = [
        'tracking_enabled' => 'boolean',
        'collect_device_info' => 'boolean',
        'collect_referrer' => 'boolean',
        'collect_browser_info' => 'boolean',
        'auto_delete_old_data' => 'boolean',
    ];

    public function autoSchool(): BelongsTo
    {
        return $this->belongsTo(AutoSchool::class);
    }

    /**
     * Create default settings for a school
     */
    public static function createDefaults($schoolId)
    {
        return self::firstOrCreate(
            ['auto_school_id' => $schoolId],
            [
                'tracking_enabled' => true,
                'collect_device_info' => true,
                'collect_referrer' => true,
                'collect_browser_info' => true,
                'data_retention_days' => 90,
                'auto_delete_old_data' => true,
            ]
        );
    }

    /**
     * Enable tracking
     */
    public function enableTracking()
    {
        $this->update(['tracking_enabled' => true]);
        return $this;
    }

    /**
     * Disable tracking
     */
    public function disableTracking()
    {
        $this->update(['tracking_enabled' => false]);
        return $this;
    }

    /**
     * Check if can collect device info
     */
    public function canCollectDeviceInfo()
    {
        return $this->tracking_enabled && $this->collect_device_info;
    }

    /**
     * Check if can collect referrer
     */
    public function canCollectReferrer()
    {
        return $this->tracking_enabled && $this->collect_referrer;
    }

    /**
     * Check if can collect browser info
     */
    public function canCollectBrowserInfo()
    {
        return $this->tracking_enabled && $this->collect_browser_info;
    }
}
