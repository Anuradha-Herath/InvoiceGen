@echo off
REM Invoice Generator SaaS - Local Development Setup Script

echo ================================
echo Invoice Generator SaaS
echo Local Development Setup
echo ================================
echo.

echo Step 1: Installing dependencies...
call npm run install:all
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    exit /b 1
)

echo.
echo Step 2: Setup complete!
echo.
echo ================================
echo To start development:
echo.
echo   npm run dev
echo.
echo This will start:
echo   - Backend API on http://localhost:3001
echo   - Frontend on http://localhost:3000
echo ================================
echo.
echo Documentation: See LOCAL_DEVELOPMENT.md
echo.
pause
