# Universal Data Router

**AI-Powered Multi-Source File Organizer by GlowStarLabs**

Part of the [GlowStarLabs / Audrey Evans Ecosystem](https://meetaudreyevans.com)

---

## What It Does

Universal Data Router connects to multiple data sources — Gmail, Google Drive, GitHub, Dropbox, and your local filesystem — and uses AI to automatically categorize, deduplicate, and route your files. Stop losing files across 5+ services. Stop manually organizing. Let AI handle it.

### Core Features

| Feature | Description |
|---|---|
| **Multi-Source Connection** | Gmail, Google Drive, GitHub, Dropbox, local filesystem |
| **AI Categorization** | OpenRouter-powered automatic file classification |
| **Rule-Based Routing** | Create custom rules to auto-sort files by type, name, size, date |
| **ML-Based Learning** | System learns from your behavior and suggests new rules |
| **Deduplication** | SHA-256 + fuzzy name matching across all sources |
| **Smart Search** | Full-text search across every connected source |
| **File Conversion** | On-the-fly format conversion (CSV→XLSX, MD→HTML, etc.) |
| **Scheduled Automation** | Daily/weekly organization runs via Celery Beat |
| **Carbon Tracking** | Built-in eco tracker for API call carbon footprint |
| **Subscription Tiers** | Free, Pro, Enterprise via Stripe billing |

### Target Market (Blue Ocean)

- People with files scattered across 5+ services
- Small businesses drowning in unorganized documents
- Freelancers managing client files across platforms
- Anyone who's ever lost a file and couldn't remember where they saved it

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + Vite |
| **Backend** | FastAPI (Python 3.11) |
| **AI** | OpenRouter API (Claude, GPT-4, etc.) |
| **Database** | PostgreSQL 16 |
| **Queue** | Redis 7 + Celery |
| **Auth** | JWT + Google OAuth + GitHub OAuth |
| **Payments** | Stripe |
| **Infrastructure** | Docker Compose + Nginx |
| **CI/CD** | GitHub Actions |

---

## Design Philosophy

### Warm Earthy Dark Theme (No Blue Light)

The entire UI uses a warm earthy palette — deep reds, forest greens, warm golds, and earthy charcoal. Zero blue light. Designed for extended use without eye strain.

### Glassmorphism UI

Frosted glass panels with backdrop blur, subtle borders, and layered depth. Every component uses the glass-panel system for visual consistency.

### WCAG AAA Accessibility

- Skip-to-content links
- Full ARIA labels on every interactive element
- Screen reader compatible navigation
- High contrast mode support
- Focus indicators on all interactive elements
- `prefers-reduced-motion` support

### Neurodivergent-Friendly

- Clean, uncluttered layouts
- Clear "next action" indicators
- Progress bars and step indicators on all wizards
- Consistent navigation patterns
- No overwhelming animations

### Mobile-First Responsive

Every component is designed mobile-first with responsive breakpoints at `sm`, `md`, `lg`, and `xl`.

### Carbon-Efficient Code

Built-in carbon tracking middleware measures API call duration and data transfer, estimating CO2 footprint. Gzip compression enabled throughout. Eco settings allow scheduling heavy processing during off-peak energy hours.

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/MIDNGHTSAPPHIRE/universal-data-router.git
cd universal-data-router
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys and secrets
```

**Required environment variables:**

| Variable | Description |
|---|---|
| `SECRET_KEY` | Random secret for JWT signing |
| `OPENROUTER_API_KEY` | Your OpenRouter API key for AI categorization |
| `STRIPE_SECRET_KEY` | Stripe secret key for billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

### 3. Start All Services

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **FastAPI Backend** on port 8000
- **Celery Worker** (background processing)
- **Celery Beat** (scheduled tasks)
- **React Frontend** on port 3000
- **Nginx** reverse proxy on port 80

### 4. Run Database Migrations

```bash
docker compose exec backend alembic upgrade head
```

### 5. Access the Application

- **Frontend:** http://localhost (or http://localhost:3000)
- **API Docs:** http://localhost:8000/api/docs
- **API ReDoc:** http://localhost:8000/api/redoc

---

## Development Setup

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### Run Tests

```bash
cd backend
pytest tests/ -v --tb=short
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login with email/password |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `GET` | `/api/v1/auth/google` | Google OAuth redirect |
| `GET` | `/api/v1/auth/github` | GitHub OAuth redirect |

### Sources

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/sources/` | List connected sources |
| `POST` | `/api/v1/sources/` | Connect new source |
| `DELETE` | `/api/v1/sources/{id}` | Disconnect source |
| `POST` | `/api/v1/sources/{id}/scan` | Trigger file scan |
| `POST` | `/api/v1/sources/{id}/sync` | Sync source |

### Files

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/files/` | List files (paginated) |
| `POST` | `/api/v1/files/search` | Smart search |
| `POST` | `/api/v1/files/categorize` | AI categorize files |
| `POST` | `/api/v1/files/deduplicate` | Run deduplication |
| `GET` | `/api/v1/files/duplicates` | Get duplicate groups |
| `GET` | `/api/v1/files/conversions` | Supported conversions |

### Rules

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/rules/` | List routing rules |
| `POST` | `/api/v1/rules/` | Create rule |
| `PATCH` | `/api/v1/rules/{id}` | Update rule |
| `DELETE` | `/api/v1/rules/{id}` | Delete rule |
| `POST` | `/api/v1/rules/suggest` | AI-suggest rules |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/stats` | Full dashboard stats |
| `GET` | `/api/v1/dashboard/carbon` | Carbon metrics |

### Billing

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/billing/subscription` | Current subscription |
| `POST` | `/api/v1/billing/checkout` | Create Stripe checkout |
| `POST` | `/api/v1/billing/portal` | Stripe customer portal |
| `POST` | `/api/v1/billing/webhook` | Stripe webhook handler |

---

## Database Schema

```
users
├── sources (1:many)
├── files (1:many)
├── categories (1:many)
├── routing_rules (1:many)
├── sync_logs (1:many)
└── subscriptions (1:1)
```

### Subscription Tiers

| Feature | Free | Pro ($12/mo) | Enterprise ($49/mo) |
|---|---|---|---|
| Sources | 2 | 10 | Unlimited |
| Files | 500 | 50,000 | Unlimited |
| Rules | 5 | 100 | Unlimited |
| AI Categorizations/mo | 50 | 500 | 5,000 |
| Crossover Memory | No | No | Yes |
| File Conversion | No | Yes | Yes |
| Scheduled Automation | No | Yes | Yes |
| Priority Support | No | Yes | Yes |

---

## Project Structure

```
universal-data-router/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI route handlers
│   │   ├── core/          # Config, database, security, carbon
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── services/      # AI, deduplication, conversion, billing
│   │   ├── tasks/         # Celery async tasks
│   │   └── main.py        # FastAPI application entry
│   ├── alembic/           # Database migrations
│   ├── tests/             # Pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Zustand state management
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API client
│   │   ├── styles/        # Global CSS + Tailwind
│   │   └── types/         # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── nginx/                 # Reverse proxy config
├── .github/workflows/     # CI/CD pipeline
├── docker-compose.yml     # Full stack orchestration
├── .env.example           # Environment template
└── README.md
```

---

## Attribution

- **AI Categorization:** Powered by [OpenRouter API](https://openrouter.ai)
- **Payment Processing:** Provided by [Stripe](https://stripe.com)
- **Built with:** Free and open-source tools (FastAPI, React, PostgreSQL, Redis, Celery)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Ecosystem

This project is part of the **GlowStarLabs / Audrey Evans** ecosystem.

Visit the hub: [meetaudreyevans.com](https://meetaudreyevans.com)

---

*Carbon-efficient by design. Built for people who refuse to lose another file.*
