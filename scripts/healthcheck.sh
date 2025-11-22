#!/bin/bash

# Bookstore Management System Health Check Script
# This script verifies that all services are running correctly

echo "🏥 Starting health check for Bookstore Management System..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a URL is accessible
check_url() {
    local url=$1
    local service_name=$2
    local timeout=${3:-10}
    
    echo -n "🔍 Checking $service_name ($url)... "
    
    if curl -f --max-time $timeout --silent "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check database connection
check_database() {
    echo -n "🔍 Checking MySQL database... "
    
    if docker-compose -f docker-compose.prod.yml exec -T mysql mysqladmin ping -h localhost --silent; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check if containers are running
check_containers() {
    echo "🐳 Checking Docker containers..."
    
    containers=("bookstore_mysql_prod" "bookstore_backend_prod" "bookstore_frontend_prod" "bookstore_nginx_prod")
    
    for container in "${containers[@]}"; do
        echo -n "🔍 Checking $container... "
        
        if docker ps --format "table {{.Names}}" | grep -q "$container"; then
            echo -e "${GREEN}✅ RUNNING${NC}"
        else
            echo -e "${RED}❌ NOT RUNNING${NC}"
            return 1
        fi
    done
    
    return 0
}

# Main health checks
failed_checks=0

# Check Docker containers
if ! check_containers; then
    ((failed_checks++))
fi

echo ""

# Check database
if ! check_database; then
    ((failed_checks++))
fi

# Check backend health endpoint
if ! check_url "http://localhost:8000/health" "Backend Health"; then
    ((failed_checks++))
fi

# Check backend API endpoints
if ! check_url "http://localhost:8000/api/v1/books?skip=0&limit=1" "Backend Books API"; then
    ((failed_checks++))
fi

if ! check_url "http://localhost:8000/api/v1/categories" "Backend Categories API"; then
    ((failed_checks++))
fi

# Check frontend
if ! check_url "http://localhost:3000" "Frontend Application"; then
    ((failed_checks++))
fi

# Check nginx proxy
if ! check_url "http://localhost" "Nginx Proxy"; then
    ((failed_checks++))
fi

echo ""
echo "================================================"

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}🎉 All health checks passed! System is healthy.${NC}"
    exit 0
else
    echo -e "${RED}❌ $failed_checks health check(s) failed!${NC}"
    echo -e "${YELLOW}💡 Check the logs with: make logs${NC}"
    exit 1
fi