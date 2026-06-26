# PROJECT_ANALYSIS.md — Rapport Complet du Projet

> **Auto-École SaaS Platform — Analyse & Roadmap**
> Date d'analyse : 2026-06-26
> Analysé par : Claude Code (claude-sonnet-4-6)

---

## 1. Vue d'ensemble

Plateforme SaaS B2B/B2C de gestion et de mise en visibilité des auto-écoles marocaines.
Inspirée de `autoecoles.ma`, elle connecte **les propriétaires d'auto-écoles** (abonnés payants)
aux **candidats au permis** (utilisateurs publics).

**Stack technique :**

| Couche | Technologie |
|--------|-------------|
| Framework PHP | Laravel 11 (≈ v12 par configuration) |
| Frontend | React 18 + Inertia.js v1 |
| Bundler | Vite 5 |
| CSS | Tailwind CSS 3 |
| Base de données | MySQL (via Eloquent ORM) |
| Auth Web | Laravel Breeze (sessions) |
| Auth API | Laravel Sanctum (tokens) |
| Paiement | Stripe PHP SDK v14 |
| Slugs | cviebrock/eloquent-sluggable |
| Routes JS | tightenco/ziggy |
| Queue | Database driver |
| Cache | Database driver |
| Mail | Log driver (dev uniquement) |
| Stockage | Local filesystem |

---

## 2. Architecture

```
saas-boilerplate/
├── app/
│   ├── Console/Commands/        # Commandes Artisan
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/           # Contrôleurs web admin (Inertia)
│   │   │   ├── Analytics/       # Contrôleurs tracking public
│   │   │   ├── Api/             # API REST (Sanctum)
│   │   │   │   ├── Admin/       # API admin
│   │   │   └── Auth/            # Auth Breeze (web)
│   │   ├── Middleware/
│   │   ├── Requests/            # Form Requests
│   │   └── Resources/           # API Resources (partiel)
│   ├── Models/
│   ├── Observers/
│   ├── Policies/
│   ├── Providers/
│   └── Services/
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/js/
│   ├── Components/
│   ├── Layouts/
│   └── Pages/
│       ├── Admin/
│       ├── Auth/
│       ├── SchoolDashboard/
│       └── (pages publiques)
└── routes/
    ├── web.php          # Routes Inertia
    ├── api.php          # API publique
    ├── admin.php        # API admin
    ├── school-dashboard.php  # API école
    ├── analytics.php    # API tracking/analytics
    └── auth.php         # Auth Breeze
```

**Pattern architectural dominant :** Monolithe Laravel + SPA Inertia.
Les dashboards admin/école consomment l'API REST via `axios` + `localStorage` token
(pattern hybride incohérent avec Inertia — voir §13 Problèmes).

---

## 3. Base de données

### Tables existantes

| Table | Description | Clé notable |
|-------|-------------|-------------|
| `users` | Utilisateurs avec rôles | `role`, `is_active`, `phone` |
| `auto_schools` | Profils auto-écoles | slug unique, soft deletes, fulltext index |
| `categories` | Types de permis (A, B, C…) | pivot `school_categories` |
| `school_categories` | Pivot école ↔ catégorie | |
| `services` | Services proposés par école | FK `auto_school_id` |
| `reviews` | Avis utilisateurs | `verified`, `helpful_count`, soft deletes |
| `plans` | Plans d'abonnement | `stripe_price_id`, `features` JSON |
| `subscriptions` | Abonnements écoles | `stripe_subscription_id`, `status` enum |
| `payments` | Historique paiements | `stripe_payment_id`, `status` enum |
| `stats` | Stats simples par date | `views_count`, `date` |
| `school_views` | Vues individuelles | `auto_school_id`, `user_id` |
| `social_clicks` | Clics réseaux sociaux | |
| `contact_requests` | Demandes de contact | |
| `school_clicks` | Clics profil école | |
| `view_events` | Événements vue détaillés | IP, device, browser |
| `click_events` | Événements clics | `click_type` enum |
| `lead_events` | Leads/contacts qualifiés | `status` enum (new→converted) |
| `analytics_daily_stats` | Stats agrégées/jour | 20+ métriques |
| `analytics_monthly_stats` | Stats agrégées/mois | CTR, conversion_rate |
| `analytics_settings` | Config tracking/école | `tracking_enabled`, retention |
| `personal_access_tokens` | Sanctum tokens | |
| `packages` | (Boilerplate legacy) | non utilisé |
| `transactions` | (Boilerplate legacy) | non utilisé |
| `features` | (Boilerplate legacy) | non utilisé |
| `used_features` | (Boilerplate legacy) | non utilisé |
| `cache` | Cache DB | |
| `jobs` | Queue DB | |
| `sessions` | Sessions DB | |

### Problèmes détectés dans le schéma

- `payments.subscription_id` n'a pas de contrainte FK (commenté intentionnellement).
- `reviews` n'a pas de colonne `status` en BDD malgré un filtre `where('status', 'pending')` dans `AdminDashboardController`.
- Double couche analytics : anciens `school_views` / `social_clicks` / `contact_requests` + nouveau système `view_events` / `click_events` / `lead_events` + agrégats `analytics_daily_stats`. Redondance à nettoyer.
- `AutoSchool` référence `SchoolClick` (model inexistant — relation `clicks()` cassée).

---

## 4. Modèles

| Modèle | Traits | Relations notables |
|--------|--------|--------------------|
| `User` | HasApiTokens, HasFactory, Notifiable | hasOne AutoSchool, hasMany Reviews |
| `AutoSchool` | HasFactory, SoftDeletes, Sluggable | belongsTo User, BelongsToMany Category, hasMany Service/Review/Stat/Payment |
| `Category` | — | BelongsToMany AutoSchool |
| `Service` | — | belongsTo AutoSchool |
| `Review` | SoftDeletes | belongsTo User, AutoSchool |
| `Plan` | — | hasMany Subscription |
| `Subscription` | — | belongsTo AutoSchool, Plan; hasMany Payment |
| `Payment` | — | belongsTo AutoSchool |
| `Stat` | — | belongsTo AutoSchool |
| `SchoolView` | — | belongsTo AutoSchool |
| `SocialClick` | — | belongsTo AutoSchool |
| `ContactRequest` | — | belongsTo AutoSchool |
| `ViewEvent` | — | belongsTo AutoSchool, User |
| `ClickEvent` | — | belongsTo AutoSchool |
| `LeadEvent` | — | belongsTo AutoSchool |
| `AnalyticsDailyStat` | — | belongsTo AutoSchool |
| `AnalyticsMonthStat` | — | belongsTo AutoSchool |
| `AnalyticsSetting` | — | belongsTo AutoSchool |

**Modèles présents mais vides / boilerplate non utilisés :** `Package`, `Transaction`, `Feature`, `UsedFeature`.

**Modèle manquant :** `SchoolClick` (référencé dans `AutoSchool::clicks()`).

---

## 5. Contrôleurs

### Web (Inertia — sessions)

| Contrôleur | Rôle |
|------------|------|
| `Auth/*` | Login, Register, Password reset, Email verify (Breeze) |
| `ProfileController` | CRUD profil utilisateur connecté |
| `Admin/AdminDashboardController` | Vue admin dashboard (Inertia) |
| `Admin/AutoSchoolController` | Gestion écoles (Inertia) |
| `Admin/PaymentController` | Paiements (Inertia) |
| `Admin/ReviewController` | Avis (Inertia) |
| `Admin/SubscriptionController` | Abonnements (Inertia) |
| `Admin/UserController` | Utilisateurs (Inertia) |
| `Analytics/ContactRequestController` | Tracking contacts public |
| `Analytics/SocialClickController` | Tracking clics sociaux |
| `Analytics/TrackViewController` | Tracking vues |
| `CreditController` | (Boilerplate legacy) |
| `Feature1Controller` | (Boilerplate legacy) |
| `Feature2Controller` | (Boilerplate legacy) |

### API REST (Sanctum — tokens)

| Contrôleur | Route prefix | Rôle |
|------------|-------------|------|
| `Api/AuthController` | `/api/v1/auth` | Login/Register/Me/Logout |
| `Api/AutoSchoolController` | `/api/v1/auto-schools` | CRUD écoles |
| `Api/ReviewController` | `/api/v1/.../reviews` | CRUD avis |
| `Api/SubscriptionController` | `/api/v1/subscribe` | Plans + abonnements |
| `Api/AdminDashboardController` | `/api/v1/admin/dashboard` | KPIs admin |
| `Api/AdminUsersController` | `/api/v1/admin/users` | CRUD users admin |
| `Api/AdminSchoolsController` | `/api/v1/admin/schools` | CRUD + approve/reject |
| `Api/AdminReviewsController` | `/api/v1/admin/reviews` | Modération avis |
| `Api/AdminPaymentsController` | `/api/v1/admin/payments` | Historique paiements |
| `Api/AdminSubscriptionsController` | `/api/v1/admin/subscriptions` | Gestion abonnements |
| `Api/AdminAnalyticsController` | `/api/v1/admin/analytics` | Analytics admin |
| `Api/Admin/AdminAnalyticsController` | `/api/v1/admin/analytics` | **Doublon** du précédent |
| `Api/SchoolDashboardController` | `/api/v1/school/dashboard` | KPIs école |
| `Api/SchoolProfileController` | `/api/v1/school/.../profile` | Profil + upload |
| `Api/SchoolServiceController` | `/api/v1/school/.../services` | CRUD services |
| `Api/AnalyticsController` | `/api/v1/school/analytics` | Analytics école |
| `Api/TrackingController` | `/api/v1/track` | Tracking public |

**Problème majeur :** `AdminDashboardController::index()` appelle `$this->authorize('isAdmin')` — cette Gate n'existe pas dans `AppServiceProvider`. Va lever une `AuthorizationException`.

---

## 6. Services

| Service | État | Rôle |
|---------|------|------|
| `AnalyticsService` | Complet | Dashboard, comparaison, mensuel, annuel, funnel, ROI |
| `TrackingService` | Complet | trackView, trackClick, trackLead (avec anonymisation IP) |
| `NotificationService` | **Vide** (1 ligne) | À implémenter |
| `PaymentService` | **Vide** (1 ligne) | À implémenter — Stripe non câblé |
| `SubscriptionService` | **Vide** (1 ligne) | À implémenter |

---

## 7. Middleware

| Alias | Classe | Rôle |
|-------|--------|------|
| `admin` | `AdminMiddleware` | Vérifie `role === 'admin'` + `is_active` |
| `school.owner` | `SchoolOwnerMiddleware` | Vérifie `role === 'school_owner'` |
| `subscription` | `CheckSubscription` | Vérifie abonnement actif |
| `role` | `CheckRole` | Vérification générique de rôle |
| `HandleInertiaRequests` | — | Partage `auth.user` avec Inertia |
| `TrackSchoolView` | — | Tracking vues auto (non enregistré dans routes) |

---

## 8. Policies

| Policy | Méthodes | État |
|--------|----------|------|
| `AutoSchoolPolicy` | — | **Vide** (1 ligne) |
| `PaymentPolicy` | — | **Vide** (1 ligne) |
| `ReviewPolicy` | — | **Vide** (1 ligne) |
| `SubscriptionPolicy` | — | **Vide** (1 ligne) |

Les policies sont déclarées mais entièrement vides. La vérification d'autorisation
est faite manuellement dans les contrôleurs (`if ($school->user_id !== auth()->user()->id)`).

---

## 9. React / Inertia — Frontend

### Pages publiques

| Page | Fichier | État |
|------|---------|------|
| Accueil | `Pages/HomePage.jsx` | Minimal — hero + pricing statique |
| Recherche | `Pages/SearchPage.jsx` | Fonctionnel — filtres ville/nom, grid écoles |
| Détail école | `Pages/DetailPage.jsx` | Fonctionnel — banner, reviews, services, WhatsApp |

### Auth

| Page | État |
|------|------|
| Login | Breeze par défaut |
| Register | Breeze par défaut |
| ForgotPassword | Breeze par défaut |
| ResetPassword | Breeze par défaut |
| VerifyEmail | Breeze par défaut |

### Dashboard École (`/school/*`)

| Page | Fichier | État |
|------|---------|------|
| Overview | `SchoolDashboard/Overview.jsx` | **Vide** (1 ligne) |
| Analytics | `SchoolDashboard/Analytics.jsx` | Minimal — composants Analytics/* |
| Analytics Dashboard | `SchoolDashboard/Analytics/Dashboard.jsx` | Existant |
| Leads Management | `SchoolDashboard/Analytics/LeadsManagement.jsx` | Existant |
| Reviews | `SchoolDashboard/Reviews.jsx` | Existant |
| Services | `SchoolDashboard/Services.jsx` | Existant |
| Settings | `SchoolDashboard/Settings.jsx` | Existant |
| Subscription | `SchoolDashboard/Subscription.jsx` | Existant |

### Dashboard Admin (`/admin/*`)

| Page | Fichier | État |
|------|---------|------|
| Dashboard | `Admin/AdminDashboard.jsx` | Fonctionnel — axios + localStorage token |
| Analytics | `Admin/Analytics.jsx` | Existant |
| Analytics Dashboard | `Admin/Analytics/Dashboard.jsx` | Existant |
| AutoSchools | `Admin/AutoSchools.jsx` | Existant |
| Users | `Admin/Users.jsx` | Existant |
| UsersPage | `Admin/UsersPage.jsx` | **Doublon** de Users.jsx |
| Reviews | `Admin/Reviews.jsx` | Existant |
| Subscriptions | `Admin/Subscriptions.jsx` | Existant |
| Payments | `Admin/Payments.jsx` | Existant |

### Composants

| Dossier | Composants |
|---------|-----------|
| `Components/Analytics/` | BarChart, LineChart, PieChart, StatsCard, DateRangePicker |
| `Components/Dashboard/` | AnalyticsCharts, MediaUpload, OverviewCards, ProfileEditor, ServicesManager |
| `Components/Common/` | Alert, Tabs |
| `Components/` | ApplicationLogo, Checkbox, CreditPricingCards, DangerButton, Dropdown, Feature, InputError, InputLabel, Modal, NavLink, PrimaryButton, ResponsiveNavLink, ReviewCard, SecondaryButton, ServiceCard, StatCard, SubscriptionCard, TextInput, AnalyticsChart |

### Layouts

| Layout | Rôle |
|--------|------|
| `AuthenticatedLayout` | Layout utilisateur connecté (nav + profil) |
| `GuestLayout` | Layout pages auth |

**Manquant :** Layout dédié Admin, Layout dédié École (sidebar navigation).

---

## 10. API — État

### API publique (`/api/v1/`)

| Endpoint | Méthode | Auth | État |
|----------|---------|------|------|
| `/auto-schools` | GET | Non | Fonctionnel |
| `/auto-schools/{slug}` | GET | Non | Fonctionnel |
| `/plans` | GET | Non | Fonctionnel |
| `/auto-schools/{id}/reviews` | GET | Non | Fonctionnel |
| `/auth/register` | POST | Non | Fonctionnel |
| `/auth/login` | POST | Non | Fonctionnel |
| `/auth/me` | GET | Sanctum | Fonctionnel |
| `/auth/logout` | POST | Sanctum | Fonctionnel |
| `/auto-schools` | POST | Sanctum | Fonctionnel |
| `/auto-schools/{id}` | PUT | Sanctum | Fonctionnel |
| `/auto-schools/{id}` | DELETE | Sanctum | Fonctionnel |
| `/auto-schools/{id}/reviews` | POST | Sanctum | Fonctionnel |
| `/reviews/{id}` | PUT/DELETE | Sanctum | Fonctionnel |
| `/subscribe` | POST | Sanctum | **Service vide** |
| `/subscription/current` | GET | Sanctum | **Service vide** |
| `/subscription/cancel` | POST | Sanctum | **Service vide** |
| `/track/view` | POST | Non | Fonctionnel |
| `/track/click` | POST | Non | Fonctionnel |
| `/track/lead` | POST | Non | Fonctionnel |

### API Admin (`/api/v1/admin/`)

Tous les endpoints admin sont définis et leurs contrôleurs sont implémentés.
**Problème :** `AdminDashboardController` appelle une Gate inexistante.

### API École (`/api/v1/school/`)

Endpoints dashboard, profile, services et analytics définis et implémentés.

---

## 11. Authentification

**Double système en place :**

1. **Web (Breeze + sessions)** — pour les pages Inertia (login, register, profil)
2. **API (Sanctum + tokens)** — pour les dashboards admin/école qui consomment l'API via axios

**Problème architectural majeur :** Les pages Inertia (ex. `AdminDashboard.jsx`) appellent
l'API REST avec un token stocké dans `localStorage`. Or avec Inertia + Sanctum en mode
"stateful SPA", la session web suffit — il n'y a pas besoin de token dans `localStorage`.
Ce pattern hybride casse le principe d'Inertia et crée des failles (token exposé en JS).

**Redirection post-login :**
- `admin` → `/admin/dashboard`
- `school_owner` → `/school/dashboard`
- `user` → `/dashboard`

**Vérification email :** Configurée (route `verified`) mais mail driver = `log` en dev.

---

## 12. Dashboard

### Admin Dashboard
- KPIs : total users, schools, subscriptions actives, revenue, avis en attente
- Graphiques : utilisateurs mensuels (LineChart), revenus mensuels (BarChart), répartition abonnements (PieChart)
- Librairie : **Recharts** (importée dans AdminDashboard mais absente de `package.json` → à vérifier)
- Pages de gestion : Users, AutoSchools, Reviews, Subscriptions, Payments

### School Dashboard
- Overview vide
- Analytics complet (vues, clics, leads, funnel, ROI, export CSV)
- Gestion services, avis, abonnement, settings

---

## 13. Paiement

**Stripe PHP SDK v14** installé. Clés Stripe **absentes du `.env`**.

- `PaymentService` : **vide**
- `SubscriptionService` : **vide**
- `SubscriptionController` (API) : lit les plans et expose les routes mais n'implémente pas le flux Stripe
- Webhook Stripe : mentionné dans l'historique git ("fix/Stripe Webhook Working") mais absent du code actuel
- Plans définis en base : Free (0 DH), Starter (99 DH/mois), Professional (299 DH/mois)
- Paiement marocain (CMI, PayZone, Cash Plus) : **non implémenté**

---

## 14. Notifications

- `NotificationService` : **vide**
- Système de notifications Laravel (email/database) : **non configuré**
- Événements/Listeners : **aucun**
- Notifications attendues (non implémentées) :
  - Nouveau lead reçu
  - Nouvel avis
  - Abonnement expirant
  - Paiement confirmé/échoué
  - Compte validé/rejeté par admin

---

## 15. Sécurité

### Ce qui est en place

- CSRF protection (Laravel standard sur routes web)
- Sanctum pour API (tokens)
- Bcrypt password hashing (`BCRYPT_ROUNDS=12`)
- SoftDeletes sur `AutoSchool` et `Review`
- Validation des inputs via Form Requests (partiel)
- Rate limiting : **non configuré** sur les routes API
- Anonymisation IP dans `TrackingService` (dernier octet masqué)

### Failles / lacunes

| Problème | Gravité | Description |
|----------|---------|-------------|
| Token dans localStorage | Haute | XSS peut voler le token |
| Policies vides | Haute | Autorisation manuelle incohérente |
| Gate `isAdmin` inexistante | Haute | `AdminDashboardController` crash |
| Pas de rate limiting | Moyenne | API publique exposée aux abus |
| CORS non configuré | Moyenne | Pas de config `cors.php` personnalisée |
| Pas de validation sur uploads | Haute | `SchoolProfileController` uploadLogo/Banner non vérifié |
| Pas de sanitisation HTML | Moyenne | Descriptions écoles potentiellement XSS |
| `APP_DEBUG=true` en prod | Haute | Exposera stack traces |

---

## 16. Tests

### Tests existants (hérités Breeze)

- `Feature/Auth/AuthenticationTest.php`
- `Feature/Auth/EmailVerificationTest.php`
- `Feature/Auth/PasswordConfirmationTest.php`
- `Feature/Auth/PasswordResetTest.php`
- `Feature/Auth/PasswordUpdateTest.php`
- `Feature/Auth/RegistrationTest.php`
- `Feature/ProfileTest.php`
- `Feature/ExampleTest.php`
- `Unit/ExampleTest.php`

### Tests manquants

- Aucun test pour les modèles métier (AutoSchool, Review, Subscription, Plan)
- Aucun test pour les API endpoints
- Aucun test pour les Services (AnalyticsService, TrackingService)
- Aucun test pour les Middlewares
- Aucun test Pest (framework testé recommandé Laravel 11)
- Aucun test E2E (Cypress/Playwright)

---

## 17. Performances

### Ce qui est en place

- Index MySQL sur colonnes fréquentes (`city`, `verified_at`, `status`, dates)
- Index composites sur analytics (`auto_school_id + date`)
- Index UNIQUE sur `analytics_daily_stats(auto_school_id, date)`
- FULLTEXT index sur `auto_schools(name, city)`
- Eager loading partiel (`with(['categories', 'reviews', 'user'])`)
- Queue driver configuré (database) — non utilisé

### Manquants

- Cache des requêtes fréquentes (liste écoles, plans)
- Pagination sur toutes les listes admin
- Lazy loading / virtualisation côté React
- Optimistic updates dans les formulaires
- Image optimization / CDN pour logos et bannières
- Job queue pour agrégation analytics (commande `AggregateAnalytics` existante mais non schedulée)
- Compression des assets (Vite build sans optimisation avancée)

---

## 18. Fonctionnalités existantes (résumé)

| Module | État |
|--------|------|
| Auth multi-rôles (admin/school_owner/user) | Fonctionnel |
| Pages publiques (home, search, detail) | Minimal / à enrichir |
| CRUD Auto-écoles (API) | Fonctionnel |
| Catégories de permis | Fonctionnel |
| Services par école | Fonctionnel |
| Avis utilisateurs | Fonctionnel (modération manquante côté web) |
| Plans tarifaires (Free/Starter/Pro) | Définis en BDD |
| Système d'analytics avancé | Backend complet, frontend partiel |
| Tracking vues/clics/leads | Backend complet |
| Dashboard admin (KPIs + charts) | Fonctionnel (bug Gate) |
| Dashboard école (analytics, services, avis) | Partiellement fonctionnel |
| Export CSV analytics | Fonctionnel |
| Commande agrégation analytics | Existante |
| Seeders (admin, école, plans, catégories) | Fonctionnels |

---

## 19. Fonctionnalités manquantes (lacunes critiques)

| Priorité | Module | Description |
|----------|--------|-------------|
| 🔴 Critique | Paiement Stripe | PaymentService vide, flux abonnement non câblé |
| 🔴 Critique | Webhook Stripe | Non présent dans le code actuel |
| 🔴 Critique | Policies | Toutes les 4 policies sont vides |
| 🔴 Critique | Gate `isAdmin` | Bug crash dashboard admin |
| 🔴 Critique | Layout Admin/École | Pas de sidebar/navigation dédiée |
| 🔴 Critique | SchoolDashboard Overview | Page vide |
| 🟠 Haute | Notifications | NotificationService vide |
| 🟠 Haute | Inscription école | Pas de flux "créer mon école" post-register |
| 🟠 Haute | Validation/Approbation école | Flow admin approve/reject sans notification |
| 🟠 Haute | Paiement marocain | CMI / Cash Plus non intégré |
| 🟠 Haute | Carte interactive | Geolocalisation / Leaflet / Google Maps |
| 🟠 Haute | Upload fichiers | Logo/banner sans validation ni stockage cloud |
| 🟠 Haute | Rate limiting API | Pas de throttling |
| 🟠 Haute | Tests métier | Zéro test sur le code métier |
| 🟡 Moyenne | Page d'accueil | Hero minimal, pas de vrai SEO |
| 🟡 Moyenne | Recherche avancée | Pas de filtre par permis, note, tarif |
| 🟡 Moyenne | Profil utilisateur côté élève | Pas de favoris, pas de comparateur |
| 🟡 Moyenne | SEO / Meta tags | Pages publiques sans meta dynamiques |
| 🟡 Moyenne | Multilingue | Français seulement, Darija/Arabe absent |
| 🟡 Moyenne | Scheduling analytics | Commande non planifiée dans Kernel |
| 🟡 Moyenne | Admin : CRUD complet | Pages admin sans formulaires de création |
| 🟡 Moyenne | CMS mini | Plans/tarifs non éditables depuis admin |
| 🟢 Basse | Dark mode | Non prévu |
| 🟢 Basse | PWA | Non prévu |
| 🟢 Basse | Notifications push | Non prévu |
| 🟢 Basse | Application mobile | Non prévu |

---

## 20. Roadmap — Phases de développement

### Phase 0 — Corrections critiques (Bugs bloquants) `[1–2 jours]`

**Objectif :** Stabiliser ce qui existe avant d'ajouter quoi que ce soit.

1. Supprimer la Gate `isAdmin` inexistante dans `AdminDashboardController`
2. Implémenter les 4 Policies (`AutoSchoolPolicy`, `ReviewPolicy`, `PaymentPolicy`, `SubscriptionPolicy`)
3. Créer le modèle `SchoolClick` manquant
4. Ajouter la colonne `status` à la table `reviews` (migration)
5. Supprimer les doublons : `AdminUsersPage.jsx` vs `Admin/Users.jsx`, double `AdminAnalyticsController`
6. Supprimer les restes du boilerplate (`Feature1Controller`, `Feature2Controller`, `CreditController`, tables `packages/transactions/features/used_features`)
7. Fixer le pattern auth : les pages Inertia doivent utiliser la session web (pas localStorage + token API)

---

### Phase 1 — Fondations solides `[3–5 jours]`

**Objectif :** Architecture propre, navigation fonctionnelle, layouts.

1. **Layout Admin** — Sidebar avec navigation (Dashboard, Écoles, Utilisateurs, Avis, Abonnements, Paiements, Analytics)
2. **Layout École** — Sidebar avec navigation (Aperçu, Profil, Services, Avis, Analytiques, Abonnement, Paramètres)
3. **Layout Public** — Header avec logo, nav, bouton login/inscription, footer
4. **Page SchoolDashboard/Overview** — KPIs de l'école (vues, leads, note moyenne, abonnement actif)
5. **AppServiceProvider** — Enregistrement Policies, Gates, bindings
6. **HandleInertiaRequests** — Partage complet : `auth.user` avec rôle, flash messages
7. **Scheduling** — Enregistrer `AggregateAnalytics` dans la console Kernel

---

### Phase 2 — Page publique & Recherche `[3–5 jours]`

**Objectif :** Expérience B2C complète pour les candidats au permis.

1. **Homepage** — Hero avec recherche inline, featured écoles, compteurs, comment ça marche, témoignages
2. **SearchPage** — Filtres avancés (ville, catégorie permis, note min, featured), tri, pagination, vue carte
3. **DetailPage** — Contact form avec tracking lead, carte Google Maps, galerie photos, badge vérifié, partage
4. **SEO** — Meta dynamiques (Inertia Head), sitemap, Open Graph
5. **Carte interactive** — Intégration Leaflet.js ou Google Maps API

---

### Phase 3 — Inscription & Onboarding École `[2–3 jours]`

**Objectif :** Flux complet pour qu'un propriétaire crée et publie son école.

1. **RegisteredUserController** — Choix rôle à l'inscription (elève / propriétaire)
2. **Onboarding wizard** (multi-étapes) :
   - Infos de base (nom, ville, téléphone, email)
   - Catégories de permis proposées
   - Services et tarifs
   - Upload logo et bannière (avec validation MIME + max size)
   - Soumission pour validation admin
3. **Admin : workflow validation** — File d'attente des écoles en attente, approve/reject avec notification email

---

### Phase 4 — Paiement & Abonnements `[5–7 jours]`

**Objectif :** Monétisation fonctionnelle avec Stripe.

1. **Configurer Stripe** — Clés `.env`, Products/Prices Stripe correspondant aux plans
2. **PaymentService** — Créer PaymentIntent, Customer, Subscription Stripe
3. **SubscriptionService** — Subscribe, cancel, check active
4. **Webhook Stripe** — Handler pour `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
5. **Page Abonnement École** — Afficher plan actuel, upgrade/downgrade, historique factures
6. **Page Tarifs Public** — CTA avec redirect vers inscription + checkout
7. **Paiement marocain** — Évaluer CMI (Centre Monétique Interbancaire) ou PayZone comme alternative locale

---

### Phase 5 — Notifications & Emails `[2–3 jours]`

**Objectif :** Garder les utilisateurs informés.

1. **NotificationService** — Implémentation avec channels (mail + database)
2. **Mailable** :
   - Bienvenue à l'inscription
   - École approuvée / rejetée
   - Nouveau lead reçu
   - Nouvel avis
   - Abonnement expirant (J-7)
   - Paiement confirmé / échoué
3. **Notifications in-app** — Centre de notifications (dropdown dans header)
4. **Configuration Mail** — SMTP réel (Mailgun, SendGrid, Resend)

---

### Phase 6 — Sécurité & Hardening `[2–3 jours]`

**Objectif :** Prêt pour la production côté sécurité.

1. **Rate limiting** — Throttle sur API login, register, tracking, reviews
2. **Validation uploads** — MIME types, max 2Mo logo, 5Mo bannière, stockage S3/DigitalOcean Spaces
3. **Sanitisation** — Purge HTML dans descriptions (HTMLPurifier ou strip_tags)
4. **CORS** — Configurer `config/cors.php` proprement
5. **CSP headers** — Content-Security-Policy via middleware
6. **`.env` prod** — `APP_DEBUG=false`, `APP_ENV=production`, logs séparés
7. **Audit des policies** — S'assurer que toutes les actions sont protégées

---

### Phase 7 — Tests `[3–5 jours]`

**Objectif :** Couverture de test suffisante pour déployer en confiance.

1. Migrer vers **Pest** (recommandé Laravel 11)
2. **Tests unitaires** — AnalyticsService, TrackingService, SubscriptionService, PaymentService
3. **Tests de Feature** — Endpoints API (AutoSchool CRUD, Reviews, Subscriptions)
4. **Tests Middleware** — AdminMiddleware, SchoolOwnerMiddleware
5. **Tests Policies** — AutoSchoolPolicy, ReviewPolicy
6. **Tests de régression auth** — Login multi-rôles, redirections
7. Objectif couverture : **>70%** sur le code métier

---

### Phase 8 — Performance & Production `[2–4 jours]`

**Objectif :** Application rapide et scalable.

1. **Cache** — Mettre en cache la liste des villes, les plans, les écoles featured (Redis)
2. **Queue** — Jobs pour : envoi d'emails, agrégation analytics, resize images
3. **Optimistic UI** — Feedback immédiat sur formulaires React
4. **Images** — Intervention Image pour resize/optimize, lazy loading côté React
5. **Build Vite** — Minification, code splitting par route
6. **Laravel Octane** — Évaluer (Swoole/RoadRunner) pour haute concurrence
7. **CI/CD** — GitHub Actions : lint + tests + build avant deploy

---

### Phase 9 — Fonctionnalités avancées `[selon priorité]`

**Objectif :** Différenciation concurrentielle.

1. **Comparateur d'auto-écoles** — Comparer 2-3 écoles côte à côte
2. **Favoris** — Utilisateur peut sauvegarder des écoles
3. **Messagerie interne** — Fil de discussion élève ↔ école
4. **Calendrier / Disponibilités** — Créneaux de passage d'examen
5. **Badge "Vérifié"** — Process de vérification du numéro d'agrément
6. **Multilingue** — Français + Arabe (MSA) + Darija (optionnel, via Laravel localization)
7. **API publique documentée** — Swagger/Scribe pour partenaires
8. **App mobile** — React Native ou PWA

---

## Résumé des priorités immédiates

```
Semaine 1 : Phase 0 (bugs) + Phase 1 (fondations)
Semaine 2 : Phase 2 (pages publiques) + Phase 3 (onboarding)
Semaine 3 : Phase 4 (paiements)
Semaine 4 : Phase 5 (notifications) + Phase 6 (sécurité)
Semaine 5 : Phase 7 (tests)
Semaine 6 : Phase 8 (production)
Semaine 7+ : Phase 9 (features avancées)
```

---

*Rapport généré après analyse complète de tous les fichiers du projet. Aucun fichier n'a été modifié.*
