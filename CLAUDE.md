# AutoEcoles SaaS — CLAUDE.md

## Architecture

**Stack**: Laravel 11 + React 18 + Inertia.js v1 + Tailwind CSS 3 + MySQL

| Layer       | Tech                         |
|-------------|------------------------------|
| Backend     | Laravel 11 (PHP 8.2+)        |
| Frontend    | React 18 + Inertia.js        |
| CSS         | Tailwind (orange-600 brand)  |
| Charts      | Recharts                     |
| DB          | MySQL 8                      |
| Auth        | Laravel Breeze (sessions)    |
| Payments    | Stripe (PaymentIntent)       |
| Mails       | Laravel Mail (queue)         |
| Build       | Vite 5                       |

## Roles utilisateurs

| Role          | Middleware       | Accès                            |
|---------------|-----------------|----------------------------------|
| `admin`       | `admin`          | `/admin/*`                       |
| `school_owner`| `school.owner`   | `/school/*`                      |
| `user`        | `auth`           | `/` public + soumettre des avis  |

Redirect post-login : `/dashboard` → détecte le rôle → route appropriée.

## Modèles clés

- `AutoSchool`: `logo_url`, `banner_url`, `website_url`, `verified_at` (PAS logo/banner/website/is_verified)
- `Subscription`: `started_at`, `expires_at` (PAS starts_at/ends_at)
- `Payment`: `stripe_payment_intent_id`, `plan_id` (PAS stripe_payment_id)
- `Category`: colonnes `name_fr`, `name_ar`, `name_en`, `code` (PAS `name`)

## Pattern Inertia

- **Pas de localStorage** — données via props Inertia (`usePage().props`)
- Mutations : `router.post/put/delete` ou `useForm` + `form.post/put/delete`
- Pagination : `paginate()->withQueryString()` côté Laravel → liens Inertia côté React
- Flash : `->with('success', '...')` → `usePage().props.flash`

## Commandes essentielles

```bash
php artisan test           # 56 tests (doit être vert avant tout commit)
npm run build              # build Vite (doit être clean)
php artisan route:list     # vérifier les routes
php artisan migrate        # appliquer migrations
php artisan db:seed        # seeder (admin + school_owner + user de test)
```

### Seeder (comptes de test)

```
admin@autoecoles.ma   / Admin@2026!  — role: admin
ecole@autoecoles.ma   / password     — role: school_owner (demo school pre-approved)
user@autoecoles.ma    / password     — role: user
```

## Cache

- `home_page_data` — 30 min (invalidé à l'approbation d'une école)
- `search_cities` — 1h (invalidé à l'approbation)
- `search_categories` — 24h
- Driver : `CACHE_STORE=database` (par défaut), `CACHE_STORE=redis` recommandé en prod

## Paiements Stripe

1. Frontend → `POST /school/payment/intent` → `{client_secret}`
2. Frontend confirme via Stripe.js `stripe.confirmCardPayment()`
3. Webhook `POST /stripe/webhook` (exclut CSRF) → crée `Payment` + `Subscription`
4. Route succès `/school/payment/success?payment_intent=pi_xxx` → idempotent

Variables d'environnement Stripe :
```
STRIPE_KEY=pk_test_xxx
STRIPE_SECRET=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
VITE_STRIPE_KEY=pk_test_xxx
```

## Scheduler

Dans `routes/console.php` :
- `subscriptions:check-expired` — quotidien à 06h00
- `analytics:aggregate` — toutes les heures

Activer avec cron (serveur) :
```
* * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1
```

## SEO

- `GET /sitemap.xml` — dynamique (toutes auto-écoles actives)
- `DetailPage` : schema.org `DrivingSchool` + `AggregateRating` en JSON-LD
- `app.blade.php` : meta description, OG, Twitter Card, canonical

## Variables d'environnement requises

```env
APP_NAME="AutoEcoles Maroc"
APP_URL=https://votredomaine.com
DB_CONNECTION=mysql
DB_DATABASE=auto_ecole
MAIL_MAILER=smtp           # log en dev
CACHE_STORE=database       # redis en prod
QUEUE_CONNECTION=database  # redis en prod
STRIPE_KEY=...
STRIPE_SECRET=...
STRIPE_WEBHOOK_SECRET=...
VITE_STRIPE_KEY=...
```

## Structure des dossiers

```
app/
  Http/Controllers/
    Admin/         — DashboardController, UsersController, SchoolsController, ...
    School/        — DashboardController, ServicesController, SettingsController, ...
    Public/        — HomeController, SearchController, SchoolDetailController, ...
  Models/          — AutoSchool, User, Review, Service, Plan, Subscription, Payment, ...
  Services/        — AnalyticsService, TrackingService, NotificationService, SubscriptionService
  Mail/            — SchoolApproved, SchoolRejected, SubscriptionExpiringSoon, SubscriptionExpired
  Console/Commands/— CheckExpiredSubscriptions, AggregateAnalytics

resources/js/Pages/
  HomePage.jsx, SearchPage.jsx, DetailPage.jsx
  Admin/           — Dashboard, Users, AutoSchools, Reviews, Payments, Subscriptions, Analytics
  SchoolDashboard/ — Overview, Services, Settings, Subscription, Analytics, Reviews

database/
  factories/       — UserFactory, AutoSchoolFactory, ReviewFactory, ServiceFactory
  migrations/      — horodatées, phases 1-13
  seeders/         — DatabaseSeeder (comptes de test)
```
