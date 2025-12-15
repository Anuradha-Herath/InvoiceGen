@echo off
REM Invoice Generator - Project Verification & Setup

echo ========================================
echo Invoice Generator SaaS
echo Project Setup & Verification
echo ========================================
echo.

echo Checking project structure...
echo.

REM Check backend
if exist "backend\package.json" (
    echo [OK] Backend package.json found
) else (
    echo [ERROR] Backend package.json missing
    exit /b 1
)

REM Check frontend
if exist "frontend\package.json" (
    echo [OK] Frontend package.json found
) else (
    echo [ERROR] Frontend package.json missing
    exit /b 1
)

REM Check backend dependencies
if exist "backend\node_modules" (
    echo [OK] Backend node_modules installed
) else (
    echo [WARN] Backend node_modules not found - installing...
    cd backend
    call npm install
    cd ..
)

REM Check frontend dependencies
if exist "frontend\node_modules" (
    echo [OK] Frontend node_modules installed
) else (
    echo [WARN] Frontend node_modules not found - installing...
    cd frontend
    call npm install
    cd ..
)

REM Check environment files
if exist "backend\.env.local" (
    echo [OK] Backend .env.local found
) else (
    echo [WARN] Backend .env.local not found
)

if exist "frontend\.env.local" (
    echo [OK] Frontend .env.local found
) else (
    echo [WARN] Frontend .env.local not found
)

echo.
echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo   npm run dev
echo.
echo This will start:
echo   - Backend API on http://localhost:3001
echo   - Frontend on http://localhost:3000
echo.
echo ========================================
echo.
pause
