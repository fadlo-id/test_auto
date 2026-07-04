<?php

namespace App\Services;

use App\Models\AutoSchool;
use App\Models\ViewEvent;
use App\Models\ClickEvent;
use App\Models\LeadEvent;
use App\Models\AnalyticsDailyStat;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $country    = ViewEvent::detectCountry($request->header('Accept-Language'));
        $today      = today()->toDateString();

        // Fast path: session flag set during this browser session today
        $sessionKey   = 'viewed_' . $school->id . '_' . today()->format('Ymd');
        $sessionSeen  = $request->session()->has($sessionKey);

        // Authoritative check: same anonymised IP has already been counted today
        $dbSeen = $sessionSeen ? true : ViewEvent::where('auto_school_id', $school->id)
            ->where('ip_address', $ipAddress)
            ->whereBetween('created_at', [today()->startOfDay(), today()->endOfDay()])
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
            'country'          => $country,
        ]);

        // Only increment the unique-view counter once per visitor per day
        if ($isUnique) {
            $request->session()->put($sessionKey, true);

            $this->incrementDailyStats($school->id, [
                'total_views',
                $deviceType . '_views',
                (! $referrer || $referrer === '') ? 'direct_traffic' : 'referral_traffic',
            ]);
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
            'country'        => ViewEvent::detectCountry($request->header('Accept-Language')),
        ]);

        $this->incrementDailyStats($school->id, [$clickType . '_clicks', 'total_clicks']);
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
            'country'         => ViewEvent::detectCountry($request->header('Accept-Language')),
            'status'          => 'new',
        ]);

        $this->incrementDailyStats($school->id, ['new_leads']);

        return $lead;
    }

    /**
     * Increment one or more columns in today's daily stat row for a school,
     * in a single row lookup + a single batched UPDATE (instead of one
     * SELECT/INSERT + one UPDATE per column).
     */
    private function incrementDailyStats(int $schoolId, array $columns): void
    {
        $allowedColumns = [
            'total_views', 'unique_visitors', 'returning_visitors',
            'phone_clicks', 'whatsapp_clicks', 'website_clicks',
            'facebook_clicks', 'instagram_clicks', 'email_clicks', 'maps_clicks', 'total_clicks',
            'new_leads', 'converted_leads',
            'desktop_views', 'mobile_views', 'tablet_views',
            'direct_traffic', 'organic_traffic', 'referral_traffic', 'paid_traffic',
        ];

        $columns = array_values(array_unique(array_filter(
            $columns,
            fn ($column) => in_array($column, $allowedColumns, true)
        )));

        if (empty($columns)) {
            return;
        }

        $date = today()->toDateString();

        try {
            AnalyticsDailyStat::firstOrCreate(['auto_school_id' => $schoolId, 'date' => $date]);
        } catch (QueryException $e) {
            // Lost the race to a concurrent request inserting the same (school, date)
            // row first — the unique constraint means it now exists either way.
        }

        AnalyticsDailyStat::where('auto_school_id', $schoolId)
            ->where('date', $date)
            ->update(array_combine(
                $columns,
                array_map(fn ($column) => DB::raw("{$column} + 1"), $columns)
            ));
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
