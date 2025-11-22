# Production Deployment Makefile
# Bookstore Management System

.PHONY: help deploy migrate logs clean stop restart backup health

help: ## Show this help message
	@echo "Bookstore Management System - Production Deployment"
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

deploy: ## Deploy the full stack in production mode
	@echo "🚀 Deploying Bookstore Management System..."
	docker-compose -f docker-compose.prod.yml up --build -d
	@echo "✅ Deployment completed!"

migrate: ## Run database migrations
	@echo "🔄 Running database migrations..."
	docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
	@echo "✅ Migrations completed!"

logs: ## Show logs for all services
	@echo "📋 Showing application logs..."
	docker-compose -f docker-compose.prod.yml logs -f

logs-backend: ## Show backend logs only
	docker-compose -f docker-compose.prod.yml logs -f backend

logs-frontend: ## Show frontend logs only
	docker-compose -f docker-compose.prod.yml logs -f frontend

logs-mysql: ## Show MySQL logs only
	docker-compose -f docker-compose.prod.yml logs -f mysql

health: ## Check health status of all services
	@echo "🏥 Checking service health..."
	@docker-compose -f docker-compose.prod.yml ps
	@echo "🔍 Running health checks..."
	@./scripts/healthcheck.sh

stop: ## Stop all services
	@echo "🛑 Stopping all services..."
	docker-compose -f docker-compose.prod.yml down

restart: ## Restart all services
	@echo "🔄 Restarting all services..."
	docker-compose -f docker-compose.prod.yml restart

clean: ## Remove all containers, volumes, and images
	@echo "🧹 Cleaning up..."
	docker-compose -f docker-compose.prod.yml down -v --rmi all
	docker system prune -f

backup: ## Create database backup
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	docker-compose -f docker-compose.prod.yml exec mysql mysqldump -u book_admin -pYOURPASSWORD bookstore > backups/bookstore_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in backups/ directory"

restore: ## Restore database from backup (use BACKUP_FILE=filename)
	@echo "🔄 Restoring database from $(BACKUP_FILE)..."
	docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u book_admin -pYOURPASSWORD bookstore < $(BACKUP_FILE)
	@echo "✅ Database restored!"

build-backend: ## Build backend image only
	docker-compose -f docker-compose.prod.yml build backend

build-frontend: ## Build frontend image only  
	docker-compose -f docker-compose.prod.yml build frontend

dev: ## Start development environment
	docker-compose up --build

prod-setup: ## Initial production setup
	@echo "🏗️  Setting up production environment..."
	@mkdir -p ssl backups logs
	@cp backend/.env.production.example backend/.env.production
	@cp frontend/.env.production.example frontend/.env.production
	@echo "⚠️  Please edit .env.production files with your actual values"
	@echo "✅ Production setup completed!"