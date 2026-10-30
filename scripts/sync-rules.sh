#!/usr/bin/env bash
# ==============================================================================
# Script Đồng Bộ Quy Định Code Mới Nhất Từ GitHub
# ==============================================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_RULES="/root/Website_Thanh_Xuan_Company"

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}  ĐỒNG BỘ QUY ĐỊNH CODE MỚI NHẤT TỪ GITHUB                                    ${NC}"
echo -e "${BLUE}==============================================================================${NC}"

cd "$ROOT_RULES"
echo -e "${YELLOW}▶ Đang kéo commit mới nhất trên nhánh dev...${NC}"
git fetch origin dev
git pull origin dev

echo -e "\n${GREEN}✓ Quy định code đã được cập nhật mới nhất!${NC}"
echo -e "${BLUE}==============================================================================${NC}"
