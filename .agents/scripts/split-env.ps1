# Script tự động phân tách biến môi trường từ root .env sang 4 app
# Chạy lệnh: powershell -ExecutionPolicy Bypass -File .agents/scripts/split-env.ps1

$rootEnvPath = Join-Path $PSScriptRoot "..\..\.env"

if (-not (Test-Path $rootEnvPath)) {
    Write-Host "Không tìm thấy file .env tại thư mục gốc ($rootEnvPath)!" -ForegroundColor Red
    exit 1
}

# Đọc toàn bộ biến từ root .env vào từ điển
$envMap = @{}
Get-Content $rootEnvPath -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line.Split("=", 2)
        $key = $parts[0].Trim()
        $val = $parts[1].Trim()
        $envMap[$key] = $val
    }
}

Write-Host "Đã nạp $($envMap.Count) biến từ root .env thành công." -ForegroundColor Green

# 1. Tách cho Backend (be-nestjs-thanhxuan)
$beKeys = @(
    "PORT", "NODE_ENV",
    "MONGODB_LAUNDRY_URI", "MONGODB_MOVING_URI", "MONGODB_INTERNAL_URI", "MONGODB_CORE_URI",
    "JWT_SECRET", "JWT_ACCESS_EXPIRES_IN", "JWT_REFRESH_EXPIRES_IN", "STAFF_JWT_SECRET", "STAFF_JWT_EXPIRES_IN",
    "FRONTEND_URL", "CORS_ORIGINS",
    "COMPANY_EMAIL", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS",
    "AI_PROVIDER", "GEMINI_API_KEY", "OPENAI_API_KEY", "OPENROUTER_API_KEY",
    "ZALO_APP_ID", "ZALO_SECRET_KEY", "ZALO_ACCESS_TOKEN", "ZALO_REFRESH_TOKEN", "ZALO_OA_ID", "ZALO_WEBHOOK_SECRET",
    "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
    "WORKSHOP_LATITUDE", "WORKSHOP_LONGITUDE", "WORKSHOP_RADIUS_METERS", "WORKSHOP_MAX_ACCURACY", "WORKSHOP_GPS_REQUIRED"
)
$beLines = @("# Cấu hình biến môi trường Backend NestJS")
foreach ($k in $beKeys) {
    if ($envMap.ContainsKey($k)) {
        $beLines += "$k=$($envMap[$k])"
    }
}
$beTarget = Join-Path $PSScriptRoot "..\..\be-nestjs-thanhxuan\.env"
$beLines | Set-Content $beTarget -Encoding UTF8
Write-Host "✓ Đã tạo $beTarget ($($beLines.Count - 1) biến)" -ForegroundColor Cyan

# 2. Tách cho Web Giặt Là & CMS (fe-nextjs-thanhxuan-laundry)
$feLaundryKeys = @(
    "PORT",
    "NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_SITE_URL", "INTERNAL_API_URL",
    "JWT_SECRET", "JWT_ACCESS_COOKIE_MAX_AGE", "JWT_REFRESH_COOKIE_MAX_AGE"
)
$feLaundryLines = @("# Cấu hình biến môi trường Web Giặt Là & CMS")
foreach ($k in $feLaundryKeys) {
    if ($envMap.ContainsKey($k)) {
        $feLaundryLines += "$k=$($envMap[$k])"
    }
}
$feLaundryTarget = Join-Path $PSScriptRoot "..\..\fe-nextjs-thanhxuan-laundry\.env"
$feLaundryLines | Set-Content $feLaundryTarget -Encoding UTF8
Write-Host "✓ Đã tạo $feLaundryTarget ($($feLaundryLines.Count - 1) biến)" -ForegroundColor Cyan

# 3. Tách cho Cổng Nội Bộ Xưởng PWA (fe-react-thanhxuan-internal)
$feInternalLines = @(
    "# Cấu hình biến môi trường Cổng Nội Bộ PWA",
    "PORT=3001"
)
if ($envMap.ContainsKey("NEXT_PUBLIC_API_URL")) {
    $feInternalLines += "VITE_API_URL=$($envMap['NEXT_PUBLIC_API_URL'])"
} elseif ($envMap.ContainsKey("VITE_API_URL")) {
    $feInternalLines += "VITE_API_URL=$($envMap['VITE_API_URL'])"
}
$feInternalTarget = Join-Path $PSScriptRoot "..\..\fe-react-thanhxuan-internal\.env"
$feInternalLines | Set-Content $feInternalTarget -Encoding UTF8
Write-Host "✓ Đã tạo $feInternalTarget ($($feInternalLines.Count - 1) biến)" -ForegroundColor Cyan

# 4. Tách cho Web Chuyển Nhà Tiết Kiệm (fe-nextjs-chuyennhatietkiem)
$feMovingKeys = @(
    "NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_SITE_NAME", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_HOTLINE", "NEXT_PUBLIC_ZALO"
)
$feMovingLines = @(
    "# Cấu hình biến môi trường Web Chuyển Nhà",
    "PORT=3002"
)
foreach ($k in $feMovingKeys) {
    if ($envMap.ContainsKey($k)) {
        $feMovingLines += "$k=$($envMap[$k])"
    }
}
$feMovingTarget = Join-Path $PSScriptRoot "..\..\fe-nextjs-chuyennhatietkiem\.env"
$feMovingLines | Set-Content $feMovingTarget -Encoding UTF8
Write-Host "✓ Đã tạo $feMovingTarget ($($feMovingLines.Count - 1) biến)" -ForegroundColor Cyan

Write-Host "`nHoàn tất phân tách 4 file .env thành công!" -ForegroundColor Green

