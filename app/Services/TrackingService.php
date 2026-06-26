<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\ViewEvent;
use App\Models\ClickEvent;
use App\Models\LeadEvent;
use Illuminate\Http\Request;

class TrackingService
{
    /**
     * Track a profile view
     */
    public function trackView(AutoSchool $school, Request $request, $userId = null)
    {
        $settings = $school->analyticsSetting;
        
        if (!$settings || !$settings->tracking_enabled) {
            return null;
        }

        $userAgent = $request->userAgent();
        $ipAddress = $this->getIpAddress($request);

        $data = [
            'auto_school_id' => $school->id,
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'device_type' => ViewEvent::detectDeviceType($userAgent),
        ];

        if ($settings->collect_referrer) {
            $data['referrer_url'] = $request->referrer();
        }

        if ($settings->collect_browser_info) {
            $data['browser'] = ViewEvent::detectBrowser($userAgent);
            $data['operating_system'] = ViewEvent::detectOS($userAgent);
        }

        return ViewEvent::create($data);
    }

    /**
     * Track a click event
     */
    public function trackClick(AutoSchool $school, $clickType, Request $request, $userId = null)
    {
        $settings = $school->analyticsSetting;
        
        if (!$settings || !$settings->tracking_enabled) {
            return null;
        }

        // Validate click type
        $validTypes = ['phone', 'whatsapp', 'website', 'facebook', 'instagram', 'email', 'maps'];
        if (!in_array($clickType, $validTypes)) {
            throw new \InvalidArgumentException("Invalid click type: $clickType");
        }

        $userAgent = $request->userAgent();
        $ipAddress = $this->getIpAddress($request);

        $data = [
            'auto_school_id' => $school->id,
            'user_id' => $userId,
            'click_type' => $clickType,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'device_type' => ViewEvent::detectDeviceType($userAgent),
        ];

        if ($settings->collect_browser_info) {
            $data['browser'] = ViewEvent::detectBrowser($userAgent);
        }

        $data['details'] = [
            'timestamp' => now()->toIso8601String(),
            'user_agent' => $userAgent,
        ];

        if ($settings->collect_referrer) {
            $data['details']['referrer'] = $request->referrer();
        }

        return ClickEvent::create($data);
    }

    /**
     * Track a lead/contact submission
     */
    public function trackLead(
        AutoSchool $school,
        $visitorName,
        $visitorEmail,
        $visitorPhone,
        Request $request,
        $visitorMessage = null,
        $userId = null
    ) {
        $settings = $school->analyticsSetting;
        
        if (!$settings || !$settings->tracking_enabled) {
            return null;
        }

        $data = [
            'auto_school_id' => $school->id,
            'user_id' => $userId,
            'visitor_name' => $visitorName,
            'visitor_email' => $visitorEmail,
            'visitor_phone' => $visitorPhone,
            'visitor_message' => $visitorMessage,
            'ip_address' => $this->getIpAddress($request),
            'device_type' => ViewEvent::detectDeviceType($request->userAgent()),
            'status' => 'new',
        ];

        if ($settings->collect_referrer) {
            $data['referrer_url'] = $request->referrer();
        }

        return LeadEvent::create($data);
    }

    /**
     * Get anonymized IP address
     */
    private function getIpAddress(Request $request)
    {
        $ip = $request->ip();
        
        // Anonymize IP by removing last octet
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ip);
            $parts[3] = '0';
            return implode('.', $parts);
        }
        
        return $ip;
    }

    /**
     * Get click type label
     */
    public static function getClickTypeLabel($clickType)
    {
        $labels = [
            'phone' => 'Phone Call',
            'whatsapp' => 'WhatsApp',
            'website' => 'Website',
            'facebook' => 'Facebook',
            'instagram' => 'Instagram',
            'email' => 'Email',
            'maps' => 'Google Maps',
        ];

        return $labels[$clickType] ?? $clickType;
    }

    /**
     * Get click type icon
     */
    public static function getClickTypeIcon($clickType)
    {
        $icons = [
            'phone' => '☎️',
            'whatsapp' => '💬',
            'website' => '🌐',
            'facebook' => 'f',
            'instagram' => '📷',
            'email' => '✉️',
            'maps' => '📍',
        ];

        return $icons[$clickType] ?? '→';
    }
}
