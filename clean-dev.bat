@echo off
REM Clean Dev Script - Reset Node.js environment
REM Usage: clean-dev.bat or clean-dev.bat start

echo.
echo ========================================
echo   Cleaning Node.js Environment
echo ========================================
echo.

REM 1. Kill all Node.js processes
echo [1/6] Killing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel%==0 (
    echo   -^> Node.js processes killed
) else (
    echo   -^> No Node.js processes running
)

REM 2. Kill npm processes
echo [2/6] Killing npm processes...
taskkill /F /IM npm.cmd >nul 2>&1

REM 3. Clean Next.js cache
echo [3/6] Cleaning Next.js cache (.next)...
if exist ".next" (
    rmdir /s /q ".next"
    echo   -^> .next folder deleted
) else (
    echo   -^> .next folder not found
)

REM 4. Clean node_modules/.cache
echo [4/6] Cleaning node_modules cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo   -^> node_modules/.cache deleted
) else (
    echo   -^> node_modules/.cache not found
)

REM 5. Clean TypeScript build info
echo [5/6] Cleaning TypeScript build info...
del /q *.tsbuildinfo >nul 2>&1

REM 6. Clear pnpm store cache
echo [6/6] Clearing pnpm store cache...
pnpm store prune >nul 2>&1

echo.
echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.

REM Start dev server if requested
if "%1"=="start" (
    echo Starting development server...
    echo.
    pnpm dev
)
