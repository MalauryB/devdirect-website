# Clean Dev Script - Reset Node.js environment
# Usage: .\clean-dev.ps1 or .\clean-dev.ps1 -start

param(
    [switch]$start  # Start dev server after cleanup
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Cleaning Node.js Environment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Kill all Node.js processes
Write-Host "[1/6] Killing Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "  -> Killed $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Green
} else {
    Write-Host "  -> No Node.js processes running" -ForegroundColor Gray
}

# 2. Kill any npm/pnpm processes
Write-Host "[2/6] Killing npm/pnpm processes..." -ForegroundColor Yellow
$npmProcesses = Get-Process -Name "npm","pnpm" -ErrorAction SilentlyContinue
if ($npmProcesses) {
    $npmProcesses | Stop-Process -Force
    Write-Host "  -> Killed $($npmProcesses.Count) npm/pnpm process(es)" -ForegroundColor Green
} else {
    Write-Host "  -> No npm/pnpm processes running" -ForegroundColor Gray
}

# 3. Clean Next.js cache
Write-Host "[3/6] Cleaning Next.js cache (.next)..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "  -> .next folder deleted" -ForegroundColor Green
} else {
    Write-Host "  -> .next folder not found" -ForegroundColor Gray
}

# 4. Clean node_modules/.cache
Write-Host "[4/6] Cleaning node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "  -> node_modules/.cache deleted" -ForegroundColor Green
} else {
    Write-Host "  -> node_modules/.cache not found" -ForegroundColor Gray
}

# 5. Clean TypeScript build info
Write-Host "[5/6] Cleaning TypeScript build info..." -ForegroundColor Yellow
$tsBuildInfo = Get-ChildItem -Filter "*.tsbuildinfo" -ErrorAction SilentlyContinue
if ($tsBuildInfo) {
    $tsBuildInfo | Remove-Item -Force
    Write-Host "  -> Deleted $($tsBuildInfo.Count) .tsbuildinfo file(s)" -ForegroundColor Green
} else {
    Write-Host "  -> No .tsbuildinfo files found" -ForegroundColor Gray
}

# 6. Clear npm cache (optional)
Write-Host "[6/6] Clearing npm cache..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>$null
    Write-Host "  -> npm cache cleaned" -ForegroundColor Green
} catch {
    Write-Host "  -> npm cache clean skipped" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Start dev server if requested
if ($start) {
    Write-Host "Starting development server...`n" -ForegroundColor Yellow
    npm run dev
}
