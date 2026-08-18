# test_auto

------------------------------------------------------------

<div align="center">

# 🚗 AutoEcoles Maroc

**A multi-tenant SaaS marketplace connecting learner drivers with driving schools across Morocco.**
Schools apply, get moderated and approved, subscribe to a paid plan, and manage their listing, bookings and reviews from a dedicated dashboard.

[![PHP](https://img.shields.io/badge/PHP-8.2%2B-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v1-9553E9?logo=inertia&logoColor=white)](https://inertiajs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-Unspecified-lightgrey)](#-license)

</div>

---

## 📖 Table of Contents

- [✨ Overview](#-overview)
- [🚀 Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🎬 Demo](#-demo)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture](#-architecture)
- [📂 Folder Structure](#-folder-structure)
- [⚙ Installation](#-installation)
- [🔑 Environment Variables](#-environment-variables)
- [🗄 Database Setup](#-database-setup)
- [▶ Running the Project](#-running-the-project)
- [📦 Production Build](#-production-build)
- [🔒 Security](#-security)
- [🔌 API Overview](#-api-overview)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Overview

**AutoEcoles Maroc** is a directory and booking platform for driving schools ("auto-écoles") in Morocco.

- **Visitors** search schools by city and category, read reviews, and request bookings.
- **School owners** apply for a listing, get approved, subscribe to a paid plan via Stripe, and run their presence (services, gallery, bookings, reviews) from a dashboard.
- **Platform staff** moderate applications and content, manage plans/payments, and run outreach through a built-in CRM.

It is built as a single **Laravel + Inertia.js + React** application — one codebase, no separate API to maintain, with server-side rendering of every page.

---

## 🚀 Features

Only features with corresponding code in this repository are listed below.

### 🌐 Public Website

- School directory with search by city and category
- School detail pages with schema.org `DrivingSchool` / `AggregateRating` structured data (SEO rich snippets)
- Reviews, with school-owner replies
- Booking requests
- Blog (listing + article pages)
- Static pages: About, FAQ, Pricing, Contact, Privacy, Terms
- "Add your school" moderated application flow, with media/project uploads
- Dynamic sitemap index + sub-sitemaps and `robots.txt`

### 🏫 School Dashboard

- Overview dashboard
- Services management
- Photo gallery
- Bookings
- Reviews (with replies)
- Traffic statistics & analytics
- Billing, invoices and subscription management (Stripe)
- Profile & settings
- Notifications

### 👨‍💼 Admin Dashboard

- Users, roles & granular permissions (custom RBAC)
- School applications review (approve / reject) and school management
- Categories, plans, coupons, regions, ads
- Payments, subscriptions and a credit management module
- Reviews and content moderation ("signalements")
- Articles (blog) and newsletter
- Contact requests and reports
- Audit logs and system settings
- Built-in **CRM**: pipeline stages, prospects, tags, notes, activities, reminders, and outbound email/SMS logging
- Site-wide analytics (view/click tracking, aggregated stats, exports)

---

## 📸 Screenshots

> No up-to-date screenshots of the current application are included in this repository yet.
> The images referenced at the top of this README (`/screenshots/*.png`) belong to the original generic boilerplate this project was bootstrapped from and do not reflect the current AutoEcoles Maroc UI.

| Home Page | School Dashboard |
|:---:|:---:|
| _placeholder_ | _placeholder_ |

| Admin Panel | Search Page | School Profile |
|:---:|:---:|:---:|
| _placeholder_ | _placeholder_ | _placeholder_ |

---

## 🎬 Demo

No public demo deployment is currently linked from this repository. Run the project locally using the [Installation](#-installation) steps below, and sign in with one of the [seeded demo accounts](#-database-setup).

---

## 🛠 Tech Stack

| Category        | Technology                                                                 |
|------------------|-----------------------------------------------------------------------------|
| Backend          | Laravel 11 (PHP 8.2+)                                                       |
| Frontend         | React 18                                                                    |
| Routing / bridge | Inertia.js v1 (no separate REST API layer)                                 |
| Database         | MySQL 8                                                                     |
| Styling          | Tailwind CSS 3                                                              |
| Charts           | Recharts                                                                    |
| Payments         | Stripe (`stripe/stripe-php`, `@stripe/stripe-js`)                          |
| Authentication   | Laravel Breeze (sessions) + Google OAuth (Laravel Socialite)               |
| Authorization    | Custom RBAC (`HasPermissions` trait)                                       |
| Build tool       | Vite 5                                                                      |
| Cache / Queue    | Database driver by default; Redis supported                               |
| Testing          | PHPUnit, Playwright                                                        |
| Containers       | Docker + Docker Compose                                                    |

---

## 🏗 Architecture

- **Inertia monolith** — Laravel controllers return `Inertia::render()` responses consumed directly by React pages; there is no decoupled SPA/API to keep in sync.
- **Role-based routing** — `super_admin`, `admin`, `school_owner` and `user` each get their own middleware-guarded route group and dashboard.
- **Custom RBAC** — `super_admin` bypasses all checks; `admin` accounts are gated per action by permission rows, checked through a `HasPermissions` trait.
- **Stripe billing** — client-side `PaymentIntent` confirmation, completed server-side by a signature-verified, idempotent webhook handler.
- **Scheduled jobs** — subscription expiry, hourly analytics aggregation, CRM reminders, monthly credit resets, payment retries and failed-mail retries all run through the Laravel scheduler.
- **Targeted caching** — a few expensive read paths (home page data, search filters) are cached with explicit TTLs and invalidated on the relevant write action.

---

## 📂 Folder Structure

```
app/
├── Console/Commands/   # Scheduled artisan commands
├── Http/Controllers/
│   ├── Admin/          # Back office: users, schools, CRM, RBAC, reports...
│   ├── School/         # School owner dashboard
│   ├── User/           # End-user portal
│   ├── Public/         # Public site: home, search, blog, static pages
│   └── Auth/           # Breeze auth + Google OAuth
├── Models/             # Eloquent models
├── Services/           # Stripe, subscriptions, credits, CRM, analytics, SEO...
└── Mail/               # Queued transactional emails

resources/js/
├── Pages/              # Inertia pages (Admin/, SchoolDashboard/, Blog/, ...)
├── Components/         # Shared UI components
└── Layouts/            # Guest & dashboard layouts

routes/
├── web.php             # All page routes, grouped by role
├── api.php             # Health check + analytics tracking endpoints
└── console.php         # Scheduled command definitions

database/
├── migrations/         # Schema history
├── factories/          # Model factories
└── seeders/            # Demo data + demo accounts

tests/                  # PHPUnit feature & unit tests
docker/, Dockerfile, docker-compose.yml, deploy.sh   # Containerized deployment
```

---

## ⚙ Installation

Prerequisites: PHP 8.2+, Composer, Node.js 18+, MySQL 8.

```bash
git clone <your-repository-url>
cd saas-boilerplate

composer install
npm install

cp .env.example .env
php artisan key:generate
```

---

## 🔑 Environment Variables

- Copy `.env.example` to `.env` and fill in **your own** values — never commit `.env`.
- `.env.example` documents every variable the app reads, with placeholder values only.
- Real secrets (database, mail, Stripe, Google OAuth) live only in your local `.env`, which is git-ignored.

Variables worth setting deliberately:

| Variable | Notes |
|---|---|
| `APP_URL` | Must match the host/port you browse the app on — queued emails (verification, etc.) link back to this value. |
| `DB_*` | Your local MySQL connection. |
| `MAIL_*` | An SMTP provider, or `MAIL_MAILER=log` for local dev. |
| `STRIPE_KEY` / `STRIPE_SECRET` / `STRIPE_WEBHOOK_SECRET` / `VITE_STRIPE_KEY` | Test keys are fine locally. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Only needed for Google login. |

---

## 🗄 Database Setup

```bash
php artisan migrate --seed
```

The seeder creates one demo account per role:

| Role | Email | Password |
|---|---|---|
| `super_admin` | `admin@autoecoles.ma` | `Admin@2026!` |
| `admin` (limited permissions) | `manager@autoecoles.ma` | `password` |
| `school_owner` (pre-approved demo school) | `ecole@autoecoles.ma` | `password` |
| `user` | `user@autoecoles.ma` | `password` |

---

## ▶ Running the Project

```bash
php artisan serve
npm run dev
```

If you use queued mail/notifications (default: `QUEUE_CONNECTION=database`):

```bash
php artisan queue:work
```

To run the scheduled jobs locally:

```bash
php artisan schedule:work
```

---

## 📦 Production Build

```bash
composer install --no-dev --optimize-autoloader
npm run build

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
```

Or use the provided Docker Compose stack (`app`, `nginx`, `mysql`, `redis`, `queue`, `scheduler` services):

```bash
docker compose up -d --build
```

---

## 🔒 Security

- `.env` and `.env.*` are git-ignored; `.env.example` is committed with placeholder values only.
- `.claude/` (local assistant settings) and `*.log` files are git-ignored.
- No real secrets are committed anywhere in this repository or its history.
- The Stripe webhook route verifies the Stripe signature and is idempotent against duplicate delivery.
- Every request is authenticated/authorized server-side via role middleware and the custom RBAC trait — the frontend never dictates access.
- Review submissions are rate-limited.
- Admin-authored CMS content is HTML-sanitized before storage.
- Sensitive admin actions are recorded in an audit log.

---

## 🔌 API Overview

There is **no public, token-authenticated REST API** — the application is an Inertia monolith where pages are rendered server-side per session.

A small `routes/api.php` exposes a few unauthenticated, rate-limited endpoints only:

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/track/view` | Analytics: record a page view |
| POST | `/api/track/click` | Analytics: record a click event |
| POST | `/api/track/contact` | Analytics: record a contact event |
| POST | `/stripe/webhook` | Stripe webhook receiver |
| GET | `/sitemap.xml`, `/robots.txt` | SEO endpoints |

Laravel Sanctum is installed (`personal_access_tokens` table exists) but no route currently uses it — it's available if a token-authenticated API is needed later.

---

## 🚀 Deployment

1. Provision a server with PHP 8.2+, MySQL 8 and (recommended) Redis — or use the Docker Compose stack.
2. Set production environment variables (`APP_ENV=production`, `APP_DEBUG=false`, real `DB_*`/`MAIL_*`/`STRIPE_*`, `CACHE_STORE=redis`, `QUEUE_CONNECTION=redis`).
3. Run the [Production Build](#-production-build) steps, or run `bash deploy.sh [branch]` on the server.
4. Keep a queue worker and the scheduler (`* * * * * php artisan schedule:run`) running continuously.
5. Point your Stripe webhook endpoint at `/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.

---

## 🤝 Contributing

1. Fork the repository and create a feature branch.
2. Follow the existing code style (`vendor/bin/pint` for PHP).
3. Run the test suite before opening a PR:
   ```bash
   php artisan test
   npm run build
   ```
4. Open a pull request describing the change and why it's needed.

---

## 📄 License

No `LICENSE` file is currently present in this repository. Until one is added, all rights are reserved by the project owner.
