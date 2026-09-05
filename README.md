# Responsible Individuals — Social-Impact Platform

> **Building Responsible Communities. Creating Sustainable Impact.**  
> A modern, content-driven social-impact platform connecting communities, volunteers, donors, corporate/CSR partners, project teams, and administrators.

---

## 1. Solution Architecture & Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18/19, Vite, React Router 7 | Responsive public website & administrative management portal |
| **Styling** | Custom Design Tokens, CSS Modules, Lucide React, Recharts | Glassmorphic cards, fluid typography (`Outfit`, `Plus Jakarta Sans`), micro-animations |
| **Backend API** | Python 3.14+, Django 5+, Django REST Framework (DRF) | Modular domain architecture, RESTful API v1, serializers & ViewSets |
| **Authentication** | JWT (`djangorestframework-simplejwt`), Session Auth | Role-based access control (`SUPER_ADMIN`, `CONTENT_ADMIN`, `VOLUNTEER`, `DONOR`, `PARTNER`) |
| **Database** | SQLite (development) / PostgreSQL (production) | System of record with relational data models and timestamps |
| **Asynchronous Jobs** | Celery + Redis | Notification triggers, email dispatch, report downloads, background jobs |
| **Containerization** | Docker, Docker Compose | Multi-container orchestration (Django, PostgreSQL, Redis, Celery) |

---

## 2. Directory Structure

```
RI-Project Folder/
├── backend/
│   ├── manage.py
│   ├── requirements/
│   │   ├── base.txt          # Core dependencies (Django, DRF, JWT, Celery, Redis)
│   │   ├── local.txt         # Dev dependencies (pytest-django, factory-boy)
│   │   └── production.txt    # Prod dependencies (psycopg2, gunicorn, whitenoise)
│   ├── config/
│   │   ├── settings/
│   │   │   ├── base.py       # Shared settings & modular app definitions
│   │   │   ├── development.py # SQLite fallback, eager Celery tasks, CORS
│   │   │   └── production.py # PostgreSQL, security headers, Whitenoise
│   │   ├── urls.py           # Main /api/v1/ routing table
│   │   ├── celery.py         # Celery broker initialization
│   │   ├── wsgi.py & asgi.py
│   └── apps/
│       ├── core/             # TimeStampedModel, AuditLog, Admin dashboard stats, seed_data
│       ├── accounts/         # Custom User, Roles, JWT views, profile
│       ├── cms/              # Pages, page sections, hero banners, site settings
│       ├── impact/           # Focus areas, metrics, statistics counters, reports
│       ├── projects/         # Projects, categories, objectives, activities, KPIs, partners
│       ├── events/           # Events, volunteer registrations, attendance
│       ├── stories/          # Stories of change, before/after testimonials
│       ├── gallery/          # Media items, albums, tags
│       ├── volunteers/       # Profiles, opportunities, applications, logged hours
│       ├── donations/        # Campaigns, donors, transactions, 80G tax receipts
│       ├── partners/         # Corporate CSR partners, proposal inquiries
│       ├── careers/          # Job board, application submissions
│       └── contact/          # Department-routed inquiries, newsletter subscribers
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html            # Google Fonts & Open Graph SEO tags
│   └── src/
│       ├── styles/           # design-tokens.css (curated emerald, sage, amber palettes)
│       ├── services/         # api.js (Axios client with JWT interceptors)
│       ├── context/          # AuthContext.jsx
│       ├── components/       # Navbar, Footer, ImpactCounter, ProjectCard, StoryCard, EventCard, Modal
│       ├── layouts/          # PublicLayout, AdminLayout
│       ├── pages/            # Home, About, Projects, Impact, Volunteer, Donate, Events,
│       │                     # Stories, Gallery, Partners, Careers, Contact, Login, Admin
│       └── routes/           # AppRoutes.jsx
├── docker-compose.yml        # PostgreSQL, Redis, Backend, Celery
└── README.md
```

---

## 3. Quick Start Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ & npm (tested on Node v22)

### Step 1: Start the Backend (Terminal 1)
```bash
cd "RI-Project Folder"

# 1. Activate Python virtual environment
source venv/bin/activate

# 2. Enter backend directory
cd backend

# 3. Apply database migrations
python manage.py migrate

# 4. Populate realistic high-fidelity seed data
python manage.py seed_data

# 5. Start development API server
python manage.py runserver 8000
```
> The Django REST API will be live at `http://localhost:8000/api/v1/`  
> Django Admin portal will be live at `http://localhost:8000/admin/`

### Step 2: Start the Frontend (Terminal 2)
```bash
cd "RI-Project Folder/frontend"

# Start Vite React development server
npm run dev
```
> The React web platform will be running at `http://localhost:5173/`

---

## 4. Default Seeded Credentials

| Account | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@responsibleindividuals.org` | `Admin@12345` | Full administrative access to `/admin-portal` & `/admin/` |

*(On the `/login` page, click **"Use Demo Admin Credentials"** for instant 1-click test login).*

---

## 5. Key REST API Endpoints (`/api/v1/`)

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login/` | Obtain JWT access and refresh tokens |
| **Auth** | `POST` | `/api/v1/auth/register/` | Register new user |
| **Auth** | `GET` | `/api/v1/auth/me/` | Current authenticated user profile |
| **Impact** | `GET` | `/api/v1/impact/statistics/` | Homepage live macro impact counters |
| **Impact** | `GET` | `/api/v1/impact/areas/` | Focus areas with SDG alignments & metrics |
| **Impact** | `GET` | `/api/v1/impact/reports/` | Downloadable annual impact reports |
| **Projects** | `GET` | `/api/v1/projects/` | Filterable project directory |
| **Projects** | `GET` | `/api/v1/projects/{slug}/` | Deep dive project view with KPIs & activities |
| **Events** | `GET` | `/api/v1/events/` | Upcoming volunteer drives and workshops |
| **Events** | `POST` | `/api/v1/events/{slug}/register/` | Public event spot registration |
| **Volunteers** | `GET` | `/api/v1/volunteers/opportunities/` | Open volunteer positions |
| **Volunteers** | `POST` | `/api/v1/volunteers/applications/` | Submit volunteer application |
| **Donations** | `POST` | `/api/v1/donations/process/` | Process donation & generate verified 80G receipt |
| **Donations** | `GET` | `/api/v1/donations/receipt/{number}/` | Verify and retrieve 80G tax receipt |
| **Partners** | `POST` | `/api/v1/partners/enquiries/` | Corporate CSR partnership inquiries |
| **Careers** | `GET` | `/api/v1/careers/` | Open team positions & internships |
| **Contact** | `POST` | `/api/v1/contact/enquiries/` | Department routed message submission |
| **Admin** | `GET` | `/api/v1/admin/dashboard/stats/` | Executive operational KPIs and activity stream |

---

## 6. Automated Testing & Validation

### Run Backend Unit Tests:
```bash
source venv/bin/activate && cd backend && python manage.py test apps.core
```

### Run Frontend Production Build:
```bash
cd frontend && npm run build
```

---

## 7. Production Docker Deployment

To launch the full production stack with PostgreSQL, Redis, Celery, and Django behind Gunicorn:
```bash
docker compose up --build -d
```
