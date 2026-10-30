#!/usr/bin/env bash
# ==============================================================================
# Script Kiểm Tra Lỗi Hệ Thống Website Thanh Xuân (Typecheck & Lint)
# Tuân thủ Definition of Done theo AGENTS.md
# ==============================================================================
set -e

SERVICES_DIR="/root/services/thanhxuan"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}  KIỂM TRA LỖI CODE (TYPECHECK & LINT) CÁC WEBSITE ĐANG CHẠY TRÊN MÁY CHỦ    ${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# Hàm kiểm tra app
check_app() {
    local app_name="$1"
    local app_dir="$2"
    local check_typecheck="$3"
    local check_lint="$4"

    echo -e "\n${YELLOW}▶ Đang kiểm tra: ${app_name}...${NC}"
    if [ ! -d "$app_dir" ]; then
        echo -e "${RED}✘ Thư mục không tồn tại: $app_dir${NC}"
        return 1
    fi

    cd "$app_dir"

    if [ "$check_typecheck" = "true" ]; then
        echo -n "  - Typecheck (tsc --noEmit): "
        if pnpm exec tsc --noEmit > /tmp/tsc_err.log 2>&1; then
            echo -e "${GREEN}PASS ✓${NC}"
        else
            echo -e "${RED}FAILED ✘${NC}"
            head -n 25 /tmp/tsc_err.log
        fi
    fi

    if [ "$check_lint" = "true" ]; then
        if grep -q '"lint":' package.json 2>/dev/null; then
            echo -n "  - Lint (pnpm lint): "
            if pnpm lint > /tmp/lint_err.log 2>&1; then
                echo -e "${GREEN}PASS ✓${NC}"
            else
                echo -e "${YELLOW}WARNING (Xem log chi tiết tại /tmp/lint_err.log)${NC}"
                head -n 15 /tmp/lint_err.log
            fi
        else
            echo -e "  - Lint: ${BLUE}Skipped (không có script 'lint' trong package.json)${NC}"
        fi
    fi
}

# 1. Backend NestJS
check_app "Backend NestJS (be-nestjs-thanhxuan / port 5001)" "$SERVICES_DIR/backend-thanhxuan" "true" "true"

# 2. Frontend NextJS
check_app "Frontend NextJS Khách Hàng (fe-nextjs-thanhxuan-laundry / port 3000)" "$SERVICES_DIR/thanhxuan-laundry" "true" "true"

# 3. Frontend React Internal PWA
check_app "Frontend React Nội Bộ (fe-react-thanhxuan-internal / port 3001)" "$SERVICES_DIR/thanhxuan-internal" "true" "true"

echo -e "\n${BLUE}==============================================================================${NC}"
echo -e "${GREEN}Hoàn tất quá trình kiểm tra lỗi!${NC}"
echo -e "${BLUE}==============================================================================${NC}"
