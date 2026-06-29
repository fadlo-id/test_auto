<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\ViewEvent;
use App\Models\ClickEvent;
use App\Models\LeadEvent;
use App\Models\AnalyticsDailyStat;
use Illuminate\Http\Request;

class TrackingService
{
    /**
     * Track a profile view. Counts as unique only once per IP per school per day.
     * Session caches the check; DB query is the authoritative deduplication.
     */
    public function trackView(AutoSchool $school, Request $request, $userId = null): void
    {
        $userAgent  = $request->userAgent() ?? '';
        $ipAddress  = $this->anonymizeIp($request->ip() ?? '127.0.0.1');
        $deviceType = ViewEvent::detectDeviceType($userAgent);
        $referrer   = $request->headers->get('referer');
        $today      = today()->toDateString();

        // Fast path: session flag set during this browser session today
        $sessionKey   = 'viewed_' . $school->id . '_' . today()->format('Ymd');
        $sessionSeen  = $request->session()->has($sessionKey);

        // Authoritative check: same anonymised IP has already been counted today
        $dbSeen = $sessionSeen ? true : ViewEvent::where('auto_school_id', $school->id)
            ->where('ip_address', $ipAddress)
            ->whereDate('created_at', $today)
            ->exists();

        $isUnique = ! $sessionSeen && ! $dbSeen;

        // Always record the raw event (for detailed traffic analysis)
        ViewEvent::create([
            'auto_school_id'   => $school->id,
            'user_id'          => $userId,
            'ip_address'       => $ipAddress,
            'user_agent'       => substr($userAgent, 0, 255),
            'referrer_url'     => $referrer ? substr($referrer, 0, 500) : null,
            'device_type'      => $deviceType,
            'browser'          => ViewEvent::detectBrowser($userAgent),
            'operating_system' => ViewEvent::detectOS($userAgent),
        ]);

        // Only increment the unique-view counter once per visitor per day
        if ($isUnique) {
            $request->session()->put($sessionKey, true);

            $this->incrementDailyStat($school->id, 'total_views');
            $this->incrementDailyStat($school->id, $deviceType . '_views');

            if (! $referrer || $referrer === '') {
                $this->incrementDailyStat($school->id, 'direct_traffic');
            } else {
                $this->incrementDailyStat($school->id, 'referral_traffic');
            }
        }
    }

    /**
     * Track a click event (phone, whatsapp, website, etc.)
     */
    public function trackClick(AutoSchool $school, string $clickType, Request $request, $userId = null): void
    {
        $validTypes = ['phone', 'whatsapp', 'website', 'facebook', 'instagram', 'email', 'maps'];
        if (! in_array($clickType, $validTypes, true)) {
            return;
        }

        $userAgent = $request->userAgent() ?? '';
        $ipAddress = $this->anonymizeIp($request->ip() ?? '127.0.0.1');

        ClickEvent::create([
            'auto_school_id' => $school->id,
            'user_id'        => $userId,
            'click_type'     => $clickType,
            'ip_address'     => $ipAddress,
            'user_agent'     => substr($userAgent, 0, 255),
            'device_type'    => ViewEvent::detectDeviceType($userAgent),
            'browser'        => ViewEvent::detectBrowser($userAgent),
        ]);

        $this->incrementDailyStat($school->id, $clickType . '_clicks');
        $this->incrementDailyStat($school->id, 'total_clicks');
    }

    /**
     * Track a lead/contact form submission.
     */
    public function trackLead(AutoSchool $school, array $data, Request $request, $userId = null): LeadEvent
    {
        $userAgent = $request->userAgent() ?? '';
        $referrer  = $request->headers->get('referer');

        $lead = LeadEvent::create([
            'auto_school_id'  => $school->id,
            'user_id'         => $userId,
            'visitor_name'    => $data['name'],
            'visitor_email'   => $data['email'],
            'visitor_phone'   => $data['phone'],
            'visitor_message' => $data['message'] ?? null,
            'ip_address'      => $this->anonymizeIp($request->ip() ?? '127.0.0.1'),
            'device_type'     => ViewEvent::detectDeviceType($userAgent),
            'referrer_url'    => $referrer ? substr($referrer, 0, 500) : null,
            'status'          => 'new',
        ]);

        $this->incrementDailyStat($school->id, 'new_leads');

        return $lead;
    }

    /**
     * Increment a single column in today's daily stat row for a school.
     */
    private function incrementDailyStat(int $schoolId, string $column): void
    {
        $allowedColumns = [
            'total_views', 'unique_visitors', 'returning_visitors',
            'phone_clicks', 'whatsapp_clicks', 'website_clicks',
            'facebook_clicks', 'instagram_clicks', 'email_clicks', 'maps_clicks', 'total_clicks',
            'new_leads', 'converted_leads',
            'desktop_views', 'mobile_views', 'tablet_views',
            'direct_traffic', 'organic_traffic', 'referral_traffic', 'paid_traffic',
        ];

        if (! in_array($column, $allowedColumns, true)) {
            return;
        }

        AnalyticsDailyStat::firstOrCreate(
            ['auto_school_id' => $schoolId, 'date' => today()->toDateString()],
        );

        AnalyticsDailyStat::where('auto_school_id', $schoolId)
            ->where('date', today()->toDateString())
            ->increment($column);
    }

    private function anonymizeIp(string $ip): string
    {
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            // Zero-out the last octet: 192.168.1.100 → 192.168.1.0
            $parts    = explode('.', $ip);
            $parts[3] = '0';
            return implode('.', $parts);
        }

        // IPv6: keep only the first 48 bits, zero out the rest (GDPR/CNIL compliant)
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $binary = inet_pton($ip);
            if ($binary !== false) {
                $anonymized = substr($binary, 0, 6) . str_repeat("\x00", 10);
                return inet_ntop($anonymized) ?: $ip;
            }
        }

        return $ip;
    }
}
