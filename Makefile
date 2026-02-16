# ═══════════════════════════════════════════════════════════════
# Universal Data Router — Makefile
# Common development and deployment commands
# ═══════════════════════════════════════════════════════════════

.PHONY: help up down build test lint migrate logs clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Docker ────────────────────────────────────────────────────

up: ## Start all services
	docker compose up -d

down: ## Stop all services
	docker compose down

build: ## Build all Docker images
	docker compose build

logs: ## View logs (all services)
	docker compose logs -f

logs-backend: ## View backend logs
	docker compose logs -f backend

logs-worker: ## View Celery worker logs
	docker compose logs -f celery-worker

# ── Database ──────────────────────────────────────────────────

migrate: ## Run database migrations
	docker compose exec backend alembic upgrade head

migrate-create: ## Create a new migration (usage: make migrate-create MSG="description")
	docker compose exec backend alembic revision --autogenerate -m "$(MSG)"

# ── Testing ───────────────────────────────────────────────────

test: ## Run backend tests
	cd backend && python -m pytest tests/ -v --tb=short

test-cov: ## Run tests with coverage
	cd backend && python -m pytest tests/ -v --cov=app --cov-report=html

# ── Linting ───────────────────────────────────────────────────

lint: ## Run all linters
	cd backend && ruff check app/
	cd frontend && npx tsc --noEmit

# ── Development ───────────────────────────────────────────────

dev-backend: ## Start backend in dev mode
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend: ## Start frontend in dev mode
	cd frontend && npm run dev

dev-worker: ## Start Celery worker in dev mode
	cd backend && celery -A app.tasks.celery_app worker --loglevel=info

# ── Cleanup ───────────────────────────────────────────────────

clean: ## Remove all containers, volumes, and build artifacts
	docker compose down -v --remove-orphans
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf frontend/node_modules frontend/dist backend/.pytest_cache
