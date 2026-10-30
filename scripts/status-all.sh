#!/usr/bin/env bash
# ==============================================================================
# Script Kiểm Tra Trạng Thái Hoạt Động Của Hệ Thống Website Đang Chạy
# ==============================================================================
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==============================================================================${NC}"
echo -e "${BLUE}  TRẠNG THÁI RUNTIME CÁC WEBSITE ĐANG CHẠY TRÊN MÁY CHỦ                      ${NC}"
echo -e "${BLUE}==============================================================================${NC}"

# 1. Docker Containers
echo -e "\n${YELLOW}▶ [1] Trạng thái Docker Containers:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E 'NAMES|laundry' || docker ps

# 2. Nginx Service
echo -e "\n${YELLOW}▶ [2] Trạng thái Nginx Reverse Proxy:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "  Nginx: ${GREEN}RUNNING (Active) ✓${NC}"
else
    echo -e "  Nginx: ${RED}STOPPED / FAILED ✘${NC}"
fi

# 3. HTTP Endpoints Check
echo -e "\n${YELLOW}▶ [3] Kiểm tra phản hồi HTTP các dịch vụ:${NC}"

# Backend API
echo -n "  - Backend API (http://127.0.0.1:5001): "
HTTP_BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5001/ || echo "ERR")
if [ "$HTTP_BACKEND" != "000" ] && [ "$HTTP_BACKEND" != "ERR" ]; then
    echo -e "${GREEN}ONLINE (HTTP $HTTP_BACKEND) ✓${NC}"
else
    echo -e "${RED}OFFLINE ✘${NC}"
fi

# Frontend NextJS
echo -n "  - Frontend Web (http://127.0.0.1:3000): "
HTTP_FE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ || echo "ERR")
if [ "$HTTP_FE" != "000" ] && [ "$HTTP_FE" != "ERR" ]; then
    echo -e "${GREEN}ONLINE (HTTP $HTTP_FE) ✓${NC}"
else
    echo -e "${RED}OFFLINE ✘${NC}"
fi

# Internal PWA Static Files
echo -n "  - Cổng Nội Bộ PWA (/var/www/noibo/dist/index.html): "
if [ -f "/var/www/noibo/dist/index.html" ]; then
    PWA_SIZE=$(stat -c%s "/var/www/noibo/dist/index.html")
    echo -e "${GREEN}EXISTS ($PWA_SIZE bytes) ✓${NC}"
else
    echo -e "${RED}NOT FOUND ✘${NC}"
fi

# MongoDB
echo -n "  - MongoDB (Port 27017): "
if ss -tulpn | grep -q ":27017 "; then
    echo -e "${GREEN}LISTENING ✓${NC}"
else
    echo -e "${RED}NOT LISTENING ✘${NC}"
fi

echo -e "\n${BLUE}==============================================================================${NC}"
