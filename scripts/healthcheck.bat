@echo off
REM Bookstore Management System Health Check Script (Windows)
echo 🏥 Starting health check for Bookstore Management System...
echo ================================================

set "failed_checks=0"

echo 🐳 Checking Docker containers...

REM Check if containers are running
for %%i in (bookstore_mysql_prod bookstore_backend_prod bookstore_frontend_prod bookstore_nginx_prod) do (
    echo 🔍 Checking %%i...
    docker ps --filter "name=%%i" --format "table {{.Names}}" | findstr "%%i" >nul
    if errorlevel 1 (
        echo ❌ %%i NOT RUNNING
        set /a failed_checks+=1
    ) else (
        echo ✅ %%i RUNNING
    )
)

echo.

REM Check backend health
echo 🔍 Checking Backend Health...
curl -f --max-time 10 --silent "http://localhost:8000/health" >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend Health FAILED
    set /a failed_checks+=1
) else (
    echo ✅ Backend Health OK
)

REM Check backend API
echo 🔍 Checking Backend API...
curl -f --max-time 10 --silent "http://localhost:8000/api/v1/books?skip=0&limit=1" >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend API FAILED
    set /a failed_checks+=1
) else (
    echo ✅ Backend API OK
)

REM Check frontend
echo 🔍 Checking Frontend...
curl -f --max-time 10 --silent "http://localhost:3000" >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend FAILED
    set /a failed_checks+=1
) else (
    echo ✅ Frontend OK
)

REM Check nginx
echo 🔍 Checking Nginx Proxy...
curl -f --max-time 10 --silent "http://localhost" >nul 2>&1
if errorlevel 1 (
    echo ❌ Nginx Proxy FAILED
    set /a failed_checks+=1
) else (
    echo ✅ Nginx Proxy OK
)

echo.
echo ================================================

if %failed_checks%==0 (
    echo 🎉 All health checks passed! System is healthy.
    exit /b 0
) else (
    echo ❌ %failed_checks% health check(s) failed!
    echo 💡 Check the logs with: make logs
    exit /b 1
)