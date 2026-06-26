# Analytics System Setup Guide

This guide explains how to set up and configure the complete analytics system for the SaaS platform.

## System Overview

The analytics system consists of several layers:
- **Event Tracking**: Raw event capture (views, clicks, leads)
- **Data Storage**: Optimized database schema with indexes
- **Aggregation**: Daily and monthly statistics computation
- **API**: RESTful endpoints for data retrieval
- **Frontend**: React dashboards for visualization

## Installation & Setup

### 1. Database Migration

The analytics tables have been created via migration. Run:

```bash
php artisan migrate
```

This creates:
- `view_events` - Raw page view events
- `click_events` - User click events (phone, WhatsApp, etc.)
- `lead_events` - Contact form submissions
- `analytics_daily_stats` - Daily aggregated statistics
- `analytics_monthly_stats` - Monthly aggregated statistics
- `analytics_settings` - Per-school privacy settings

### 2. Install Dependencies

If you haven't already, install Chart.js for dashboard visualizations:

```bash
npm install chart.js
```

### 3. Configure Scheduler

Update your `app/Console/Kernel.php` to schedule the analytics aggregation:

```php
protected function schedule(Schedule $schedule)
{
    // Aggregate analytics daily at 2 AM
    $schedule->command('analytics:aggregate')->daily()->at('02:00');
}
```

Then ensure the scheduler is running:

```bash
# On your server, add to crontab:
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

### 4. Register Routes

Add the analytics routes to your main `routes/api.php`:

```php
Route::prefix('v1')->group(function () {
    include 'analytics.php';
});
```

### 5. Create Required Middleware

If not already created, add these middleware:

**app/Http/Middleware/SchoolOwnerMiddleware.php**
```php
public function handle($request, Closure $next)
{
    if (!auth()->check() || !auth()->user()->autoSchool) {
        return response()->json(['message' => 'Not a school owner'], 403);
    }
    return $next($request);
}
```

Register in `app/Http/Kernel.php`:
```php
protected $routeMiddleware = [
    'school.owner' => \App\Http\Middleware\SchoolOwnerMiddleware::class,
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
];
```

### 6. Publish Frontend Routes

Add these routes to your main Inertia routes file (`routes/web.php`):

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('/dashboard/analytics', 'SchoolDashboard/Analytics/Dashboard');
    Route::inertia('/dashboard/leads', 'SchoolDashboard/Analytics/LeadsManagement');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::inertia('/admin/analytics', 'Admin/Analytics/Dashboard');
});
```

## API Endpoints

### Public Tracking Endpoints

#### Track Page View
```
POST /api/v1/track/view
Body: { "school_slug": "my-school" }
```

#### Track Click Event
```
POST /api/v1/track/click
Body: { 
  "school_slug": "my-school",
  "click_type": "phone|whatsapp|website|facebook|instagram|email|maps"
}
```

#### Track Lead Submission
```
POST /api/v1/track/lead
Body: {
  "school_slug": "my-school",
  "visitor_name": "John Doe",
  "visitor_email": "john@example.com",
  "visitor_phone": "+1234567890",
  "visitor_message": "Optional message"
}
```

### School Owner Analytics Endpoints

All require `Authorization: Bearer {token}` header

```
GET /api/v1/school/analytics/dashboard?days=30
GET /api/v1/school/analytics/comparison?days=30
GET /api/v1/school/analytics/monthly?year=2026
GET /api/v1/school/analytics/annual?year=2026
GET /api/v1/school/analytics/funnel?start_date=2026-01-01&end_date=2026-12-31
GET /api/v1/school/analytics/roi?start_date=2026-01-01&end_date=2026-12-31
GET /api/v1/school/analytics/leads?status=new&page=1
GET /api/v1/school/analytics/leads/{id}
PUT /api/v1/school/analytics/leads/{id}
GET /api/v1/school/analytics/export?format=csv
```

### Admin Analytics Endpoints

All require `Authorization: Bearer {token}` + admin role

```
GET /api/v1/admin/analytics/dashboard?days=30
GET /api/v1/admin/analytics/revenue?period=monthly
GET /api/v1/admin/analytics/growth?metric=views|leads|clicks
GET /api/v1/admin/analytics/top-schools?limit=10
GET /api/v1/admin/analytics/top-clicks?days=30
GET /api/v1/admin/analytics/devices?days=30
GET /api/v1/admin/analytics/leads?status=new&page=1
```

## Frontend Integration

### React Components

The system includes ready-to-use React components:

**Main Dashboard:**
- `resources/js/Pages/SchoolDashboard/Analytics/Dashboard.jsx`
- `resources/js/Pages/Admin/Analytics/Dashboard.jsx`

**Leads Management:**
- `resources/js/Pages/SchoolDashboard/Analytics/LeadsManagement.jsx`

**Reusable Components:**
- `resources/js/Components/Analytics/StatsCard.jsx` - Metric display card
- `resources/js/Components/Analytics/LineChart.jsx` - Time series visualization
- `resources/js/Components/Analytics/BarChart.jsx` - Category comparison
- `resources/js/Components/Analytics/PieChart.jsx` - Proportion breakdown
- `resources/js/Components/Analytics/DateRangePicker.jsx` - Period selection

### Usage Example

```jsx
import Dashboard from '@/Pages/SchoolDashboard/Analytics/Dashboard';

export default function MyPage() {
  return <Dashboard />;
}
```

## Frontend Implementation in School Profile

Add tracking to the school profile page:

```jsx
// In your school profile component
import axios from 'axios';

export default function SchoolProfile({ school }) {
  useEffect(() => {
    // Track page view
    axios.post('/api/v1/track/view', {
      school_slug: school.slug
    }).catch(() => {});
  }, [school.slug]);

  const handlePhoneClick = () => {
    axios.post('/api/v1/track/click', {
      school_slug: school.slug,
      click_type: 'phone'
    }).catch(() => {});
  };

  const handleLeadSubmit = (data) => {
    axios.post('/api/v1/track/lead', {
      school_slug: school.slug,
      visitor_name: data.name,
      visitor_email: data.email,
      visitor_phone: data.phone,
      visitor_message: data.message
    }).catch(() => {});
  };

  return (
    // Your JSX with handlers
  );
}
```

## Privacy Settings

Schools can control data collection via privacy settings:

```php
// In a controller or service
$settings = $school->analyticsSetting;

// Disable tracking
$settings->disableTracking();

// Control data collection
$settings->update([
    'collect_device_info' => false,
    'collect_referrer' => false,
    'data_retention_days' => 60,
]);
```

## Data Retention

The system supports automatic data cleanup:

1. Raw events older than `data_retention_days` (default 90 days) are automatically deleted
2. Daily and monthly stats are retained indefinitely
3. Aggregation job runs daily at 2 AM

To manually clean old data:

```bash
php artisan analytics:cleanup
```

## Manual Aggregation

To manually trigger aggregation for a specific date:

```bash
# Aggregate yesterday
php artisan analytics:aggregate

# Aggregate a specific date
php artisan analytics:aggregate --date=2026-06-25
```

## Troubleshooting

### No analytics data showing
1. Ensure migration ran: `php artisan migrate`
2. Check routes are registered: `php artisan route:list | grep analytics`
3. Verify tracking calls are being made to the API
4. Check aggregation jobs ran: `php artisan tinker` → `LeadEvent::count()`

### Charts not rendering
1. Install Chart.js: `npm install chart.js`
2. Clear npm cache: `npm cache clean --force`
3. Rebuild assets: `npm run build`

### Aggregation not working
1. Ensure scheduler is running: `php artisan schedule:run`
2. Check Laravel logs: `storage/logs/laravel.log`
3. Manually run: `php artisan analytics:aggregate --date=yesterday`

## Performance Optimization

The system is optimized for scale with:
- Indexed queries on `auto_school_id`, `created_at`, `date`
- Pre-computed daily/monthly aggregates (no real-time calculations)
- Configurable data retention to control storage
- Efficient scopes for common queries

For best performance:
- Run aggregation during off-peak hours (set to 2 AM)
- Archive raw events after 90 days
- Monitor database size regularly

## Testing

Create a test school and manually trigger tracking:

```bash
php artisan tinker

# Create test data
$school = AutoSchool::first();
\App\Services\TrackingService::trackView($school, request());
\App\Services\TrackingService::trackClick($school, 'phone', request());
\App\Services\TrackingService::trackLead($school, 'Test', 'test@example.com', '1234567890', request());

# Verify aggregation
php artisan analytics:aggregate --date=today

# Check stats
AnalyticsDailyStat::latest()->first();
```

## Files Created

**Migrations:**
- `database/migrations/2026_06_26_create_analytics_tables.php`

**Models:**
- `app/Models/ViewEvent.php`
- `app/Models/ClickEvent.php`
- `app/Models/LeadEvent.php`
- `app/Models/AnalyticsDailyStat.php`
- `app/Models/AnalyticsMonthStat.php`
- `app/Models/AnalyticsSetting.php`

**Services:**
- `app/Services/TrackingService.php`
- `app/Services/AnalyticsService.php`

**Controllers:**
- `app/Http/Controllers/Api/TrackingController.php`
- `app/Http/Controllers/Api/AnalyticsController.php`
- `app/Http/Controllers/Api/Admin/AdminAnalyticsController.php`

**Commands:**
- `app/Console/Commands/AggregateAnalytics.php`

**Routes:**
- `routes/analytics.php`

**React Components:**
- `resources/js/Pages/SchoolDashboard/Analytics/Dashboard.jsx`
- `resources/js/Pages/SchoolDashboard/Analytics/LeadsManagement.jsx`
- `resources/js/Pages/Admin/Analytics/Dashboard.jsx`
- `resources/js/Components/Analytics/StatsCard.jsx`
- `resources/js/Components/Analytics/LineChart.jsx`
- `resources/js/Components/Analytics/BarChart.jsx`
- `resources/js/Components/Analytics/PieChart.jsx`
- `resources/js/Components/Analytics/DateRangePicker.jsx`

## Next Steps

1. ✅ Database schema and models
2. ✅ Services for business logic
3. ✅ API controllers and routes
4. ✅ React dashboards and components
5. ⏳ Integration into school profile pages
6. ⏳ Tests and validation
7. ⏳ Performance monitoring and optimization

For questions or issues, check the Laravel logs and API responses.
