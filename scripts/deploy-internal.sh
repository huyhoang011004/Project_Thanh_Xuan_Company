#!/usr/bin/env bash
# ==============================================================================
# Script Build & Deploy Cổng Vận Hành Nội Bộ (PWA)
# Đích: /var/www/noibo/dist (phục vụ qua Nginx noibo.thanhxuanlaundry.com)
# ==============================================================================
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SRC_DIR="/root/services/thanhxuan/thanhxuan-internal"
DEST_DIR="/var/www/noibo/dist"

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}  DEPLOY CỔNG NỘI BỘ XƯỞNG (noibo.thanhxuanlaundry.com)                      ${NC}"
echo -e "${BLUE}==============================================================================${NC}"

echo -e "\n${YELLOW}▶ [1/3] Đang biên dịch bản build React SPA (Vite + PWA)...${NC}"
cd "$SRC_DIR"
pnpm build

echo -e "\n${YELLOW}▶ [2/3] Sao chép bản build vào $DEST_DIR...${NC}"
mkdir -p "$DEST_DIR"
cp -r dist/* "$DEST_DIR/"
chown -R www-data:www-data "$DEST_DIR"

echo -e "\n${YELLOW}▶ [3/3] Kiểm tra lại quyền và reload Nginx...${NC}"
systemctl reload nginx

echo -e "\n${GREEN}✓ Đã deploy thành công cổng nội bộ lên https://noibo.thanhxuanlaundry.com !${NC}"
echo -e "${BLUE}==============================================================================${NC}"
