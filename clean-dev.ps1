# Clean Dev Script - Reset Node.js environment
# Usage: .\clean-dev.ps1 or .\clean-dev.ps1 -start

param(
    [switch]$start  # Start dev server after cleanup
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Cleaning Node.js Environment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Kill all Node.js processes
Write-Host "[1/5] Killing Node.js/npm processes..." -ForegroundColor Yellow
$processes = Get-Process -Name "node","npm","pnpm" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "  -> Killed $($processes.Count) process(es)" -ForegroundColor Green
} else {
    Write-Host "  -> No processes running" -ForegroundColor Gray
}

# 2. Clean Next.js build + cache
Write-Host "[2/5] Cleaning Next.js (.next)..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "  -> .next deleted" -ForegroundColor Green
} else {
    Write-Host "  -> .next not found" -ForegroundColor Gray
}

# 3. Clean all caches (node_modules/.cache, SWC, Webpack)
Write-Host "[3/5] Cleaning caches..." -ForegroundColor Yellow
$cachePaths = @(
    "node_modules/.cache",
    "node_modules/.swc"
)
$cleaned = 0
foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path
        Write-Host "  -> $path deleted" -ForegroundColor Green
        $cleaned++
    }
}
if ($cleaned -eq 0) {
    Write-Host "  -> No caches found" -ForegroundColor Gray
}

# 4. Clean TypeScript build info
Write-Host "[4/5] Cleaning TypeScript build info..." -ForegroundColor Yellow
$tsBuildInfo = Get-ChildItem -Filter "*.tsbuildinfo" -ErrorAction SilentlyContinue
if ($tsBuildInfo) {
    $tsBuildInfo | Remove-Item -Force
    Write-Host "  -> Deleted $($tsBuildInfo.Count) .tsbuildinfo file(s)" -ForegroundColor Green
} else {
    Write-Host "  -> No .tsbuildinfo files found" -ForegroundColor Gray
}

# 5. Clean Windows temp Next.js traces
Write-Host "[5/5] Cleaning temp files..." -ForegroundColor Yellow
$tempNextPaths = Get-ChildItem -Path $env:TEMP -Filter "next-*" -Directory -ErrorAction SilentlyContinue
if ($tempNextPaths) {
    $tempNextPaths | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  -> Deleted $($tempNextPaths.Count) temp folder(s)" -ForegroundColor Green
} else {
    Write-Host "  -> No temp files found" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Start dev server if requested
if ($start) {
    Write-Host "Starting development server...`n" -ForegroundColor Yellow
    npm run dev
}
