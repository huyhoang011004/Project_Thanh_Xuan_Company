#!/usr/bin/env bash
# ==============================================================================
# Script Build Thử Nghiệm Toàn Bộ Website Đang Chạy
# Đảm bảo không có lỗi bundle/compilation trước khi deploy
# ==============================================================================
set -e

SERVICES_DIR="/root/services/thanhxuan"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}  BUILD THỬ NGHIỆM CÁC WEBSITE ĐANG CHẠY TRÊN MÁY CHỦ                        ${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# 1. Backend NestJS
echo -e "\n${YELLOW}▶ [1/3] Building Backend NestJS...${NC}"
cd "$SERVICES_DIR/backend-thanhxuan"
if pnpm build; then
    echo -e "${GREEN}✓ Backend build thành công!${NC}"
else
    echo -e "${RED}✘ Backend build thất bại!${NC}"
    exit 1
fi

# 2. Frontend React Nội Bộ
echo -e "\n${YELLOW}▶ [2/3] Building Frontend React PWA (Nội Bộ)...${NC}"
cd "$SERVICES_DIR/thanhxuan-internal"
if pnpm build; then
    echo -e "${GREEN}✓ Frontend React PWA build thành công!${NC}"
else
    echo -e "${RED}✘ Frontend React PWA build thất bại!${NC}"
    exit 1
fi

# 3. Frontend NextJS
echo -e "\n${YELLOW}▶ [3/3] Building Frontend NextJS (Khách Hàng & CMS)...${NC}"
cd "$SERVICES_DIR/thanhxuan-laundry"
if pnpm build; then
    echo -e "${GREEN}✓ Frontend NextJS build thành công!${NC}"
else
    echo -e "${RED}✘ Frontend NextJS build thất bại!${NC}"
    exit 1
fi

echo -e "\n${BLUE}==============================================================================${NC}"
echo -e "${GREEN}Tất cả các website đều build thành công!${NC}"
echo -e "${BLUE}==============================================================================${NC}"
