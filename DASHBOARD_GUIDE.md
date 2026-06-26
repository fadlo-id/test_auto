# Auto School Dashboard - Complete Guide

Complete production-ready dashboard system for managing auto school profiles, services, media, and analytics.

## Features

✅ **Overview Cards** - Display views, clicks, reviews, rating, subscription status
✅ **Profile Management** - Edit school information (name, email, phone, address, location)
✅ **Media Upload** - Upload logo and banner with preview
✅ **Services Management** - Create, edit, delete driving school services
✅ **Analytics Integration** - View analytics summary and detailed dashboard
✅ **Responsive Design** - Works on desktop, tablet, mobile
✅ **Real-time Updates** - Instant data refresh and validation

## Frontend Components Created

### Main Dashboard Page
- **Location**: `resources/js/Pages/DashboardPage.jsx`
- **Features**: Tab navigation, data fetching, alert management, loading states
- **Props**: auth, school, plans

### Dashboard Components

1. **OverviewCards.jsx**
   - Displays key metrics in gradient cards
   - Shows: Views, Clicks, Reviews, Rating

2. **ProfileEditor.jsx**
   - Form for editing school information
   - Fields: Name, Email, Phone, Address, City, Website, Description, Coordinates
   - Validation with error display
   - API integration for updates

3. **MediaUpload.jsx**
   - Drag & drop file upload
   - Image preview before/after upload
   - Separate uploads for logo and banner
   - File validation (type, size)

4. **ServicesManager.jsx**
   - List all services
   - Add new services with form
   - Edit inline with save/cancel
   - Delete with confirmation
   - Fields: Name, Price, Duration, Description

5. **AnalyticsCharts.jsx**
   - Display analytics summary
   - Key metrics cards
   - Link to detailed analytics dashboard
   - Metric descriptions

### Utility Components

6. **Tabs.jsx** (`resources/js/Components/Common/Tabs.jsx`)
   - Tab navigation with icons
   - Active state styling
   - Responsive design

7. **Alert.jsx** (`resources/js/Components/Common/Alert.jsx`)
   - Success, error, warning, info messages
   - Auto-dismiss capability
   - Close button

## Backend Controllers

### SchoolDashboardController.php
```
GET /api/v1/school/dashboard/{id}
```
Returns complete dashboard data including:
- School profile information
- Analytics summary
- Services list
- Subscription details
- Review count and rating

### SchoolProfileController.php
```
PUT /api/v1/school/{id}/profile          - Update profile
POST /api/v1/school/{id}/upload-logo     - Upload logo
POST /api/v1/school/{id}/upload-banner   - Upload banner
```

### SchoolServiceController.php
```
GET    /api/v1/school/{schoolId}/services      - List services
POST   /api/v1/school/{schoolId}/services      - Create service
GET    /api/v1/school/{schoolId}/services/{id} - Get service
PUT    /api/v1/school/{schoolId}/services/{id} - Update service
DELETE /api/v1/school/{schoolId}/services/{id} - Delete service
```

## Validation Classes

### UpdateSchoolProfileRequest
Validates profile updates:
- `name` - Required, string, max 255
- `email` - Required, email, unique
- `phone` - Required, max 20
- `address` - Required, max 255
- `city` - Required, max 100
- `website` - Optional, valid URL
- `description` - Optional, max 1000
- `latitude` - Optional, between -90 and 90
- `longitude` - Optional, between -180 and 180

### StoreServiceRequest & UpdateServiceRequest
Validates service data:
- `name` - Required, string, max 255
- `description` - Optional, max 1000
- `price` - Required, numeric, min 0, max 999999.99
- `duration` - Optional, numeric, min 0.5, max 100

## Routes Configuration

Add to your `routes/api.php`:

```php
Route::prefix('v1')->group(function () {
    include 'analytics.php';       // Existing analytics routes
    include 'school-dashboard.php'; // New dashboard routes
});
```

Or include directly with middleware:

```php
Route::middleware(['auth:sanctum'])->prefix('v1/school')->group(function () {
    Route::get('/dashboard/{id}', [SchoolDashboardController::class, 'index']);
    Route::put('{id}/profile', [SchoolProfileController::class, 'update']);
    Route::post('{id}/upload-logo', [SchoolProfileController::class, 'uploadLogo']);
    Route::post('{id}/upload-banner', [SchoolProfileController::class, 'uploadBanner']);
    
    // Services routes
    Route::prefix('{schoolId}/services')->group(function () {
        Route::get('/', [SchoolServiceController::class, 'index']);
        Route::post('/', [SchoolServiceController::class, 'store']);
        Route::get('{id}', [SchoolServiceController::class, 'show']);
        Route::put('{id}', [SchoolServiceController::class, 'update']);
        Route::delete('{id}', [SchoolServiceController::class, 'destroy']);
    });
});
```

## API Endpoints

### Dashboard Data
```
GET /api/v1/school/dashboard/1
Authorization: Bearer {token}

Response:
{
    "id": 1,
    "name": "My Auto School",
    "email": "info@myschool.com",
    "phone": "+212612345678",
    "address": "123 Main St",
    "city": "Casablanca",
    "website": "https://myschool.com",
    "latitude": 33.5731,
    "longitude": -7.5898,
    "logo": "schools/logos/...",
    "banner": "schools/banners/...",
    "is_verified": true,
    "reviews_count": 45,
    "reviews_avg_rating": 4.5,
    "services_count": 3,
    "subscription": {
        "id": 1,
        "plan": { "id": 1, "name": "Premium", "price": 999 },
        "starts_at": "2026-06-26",
        "ends_at": "2026-07-26"
    },
    "services": [
        {
            "id": 1,
            "name": "Manual Lessons",
            "description": "Standard driving lessons",
            "price": 300,
            "duration": 1
        }
    ],
    "analytics": {
        "total_views": 1250,
        "total_clicks": 85,
        "new_leads": 15,
        "ctr": 6.8,
        "conversion_rate": 1.2
    }
}
```

### Update Profile
```
PUT /api/v1/school/1/profile
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
    "name": "Updated School Name",
    "email": "newemail@example.com",
    "phone": "+212612345678",
    "address": "456 New Street",
    "city": "Fez",
    "description": "New description",
    "latitude": 34.0209,
    "longitude": -5.0055
}

Response:
{
    "message": "Profile updated successfully",
    "data": { /* updated school object */ }
}
```

### Upload Logo
```
POST /api/v1/school/1/upload-logo
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- logo: [file]

Response:
{
    "message": "Logo uploaded successfully",
    "data": {
        "logo": "schools/logos/abc123.jpg"
    }
}
```

### Upload Banner
```
POST /api/v1/school/1/upload-banner
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- banner: [file]

Response:
{
    "message": "Banner uploaded successfully",
    "data": {
        "banner": "schools/banners/xyz789.jpg"
    }
}
```

### List Services
```
GET /api/v1/school/1/services
Authorization: Bearer {token}

Response:
[
    {
        "id": 1,
        "auto_school_id": 1,
        "name": "Manual Lessons",
        "description": "Standard driving lessons",
        "price": 300.00,
        "duration": 1.0,
        "created_at": "2026-06-26T10:00:00Z",
        "updated_at": "2026-06-26T10:00:00Z"
    }
]
```

### Create Service
```
POST /api/v1/school/1/services
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
    "name": "Automatic Lessons",
    "description": "Driving lessons for automatic cars",
    "price": 350,
    "duration": 1
}

Response:
{
    "message": "Service created successfully",
    "data": {
        "id": 2,
        "auto_school_id": 1,
        "name": "Automatic Lessons",
        "description": "Driving lessons for automatic cars",
        "price": 350.00,
        "duration": 1.0,
        "created_at": "2026-06-26T11:00:00Z",
        "updated_at": "2026-06-26T11:00:00Z"
    }
}
```

### Update Service
```
PUT /api/v1/school/1/services/2
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
    "name": "Automatic Intensive",
    "price": 400,
    "duration": 2
}

Response:
{
    "message": "Service updated successfully",
    "data": { /* updated service */ }
}
```

### Delete Service
```
DELETE /api/v1/school/1/services/2
Authorization: Bearer {token}

Response:
{
    "message": "Service deleted successfully"
}
```

## Integration Steps

### 1. Copy Files
- React components to `resources/js/`
- Controllers to `app/Http/Controllers/Api/`
- Request validation to `app/Http/Requests/`
- Routes to `routes/`

### 2. Register Routes
Update `routes/api.php`:
```php
Route::prefix('v1')->group(function () {
    include 'school-dashboard.php';
});
```

### 3. Create Migrations (if needed)
If Service model doesn't exist:
```bash
php artisan make:model Service -m
```

Add to migration:
```php
Schema::create('services', function (Blueprint $table) {
    $table->id();
    $table->foreignId('auto_school_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('description')->nullable();
    $table->decimal('price', 10, 2);
    $table->decimal('duration', 5, 2)->nullable();
    $table->timestamps();
});
```

### 4. Add Service Model Relationship
In `AutoSchool.php`:
```php
public function services()
{
    return $this->hasMany(Service::class);
}
```

### 5. Add Middleware
If not exists, create `SchoolOwnerMiddleware`:
```php
Route::middleware('school.owner')
```

### 6. Set Up Storage
```bash
php artisan storage:link
```

## Error Handling

All endpoints return structured error responses:

```json
{
    "message": "Error description",
    "errors": {
        "field_name": ["Validation error message"]
    }
}
```

## Security Features

✅ **Authentication** - Requires valid Bearer token (Sanctum)
✅ **Authorization** - School owner can only edit own school
✅ **Validation** - All inputs validated server-side
✅ **File Uploads** - File type and size validation
✅ **Storage** - Images stored in private storage path
✅ **CSRF** - Protected by Laravel middleware

## Testing

### Test Profile Update
```bash
curl -X PUT http://localhost:8000/api/v1/school/1/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test School"}'
```

### Test Service Creation
```bash
curl -X POST http://localhost:8000/api/v1/school/1/services \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Service", "price": 300}'
```

### Test Logo Upload
```bash
curl -X POST http://localhost:8000/api/v1/school/1/upload-logo \
  -H "Authorization: Bearer {token}" \
  -F "logo=@/path/to/logo.jpg"
```

## Performance Optimization

- Dashboard data cached for 5 minutes
- Images optimized on upload
- Database queries use eager loading
- Pagination for large service lists

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Files Created

**React Components (8):**
- Pages/DashboardPage.jsx
- Components/Dashboard/OverviewCards.jsx
- Components/Dashboard/ProfileEditor.jsx
- Components/Dashboard/MediaUpload.jsx
- Components/Dashboard/ServicesManager.jsx
- Components/Dashboard/AnalyticsCharts.jsx
- Components/Common/Tabs.jsx
- Components/Common/Alert.jsx

**Laravel Controllers (3):**
- Http/Controllers/Api/SchoolDashboardController.php
- Http/Controllers/Api/SchoolProfileController.php
- Http/Controllers/Api/SchoolServiceController.php

**Validation Classes (3):**
- Http/Requests/UpdateSchoolProfileRequest.php
- Http/Requests/StoreServiceRequest.php
- Http/Requests/UpdateServiceRequest.php

**Routes (1):**
- routes/school-dashboard.php

## Next Steps

1. Verify all files are in correct locations
2. Run migrations if Service model created
3. Test API endpoints
4. Integrate dashboard page into Inertia routes
5. Add any custom styling as needed
6. Deploy to production

## Support

For issues or questions, check:
- Laravel logs: `storage/logs/laravel.log`
- Browser console for JavaScript errors
- API responses for validation messages

This is a complete, production-ready system ready for immediate deployment!
