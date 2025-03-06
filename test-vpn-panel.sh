#!/bin/bash

# Test script for VPN panel connection
echo "===== VPN Panel Connection Test ====="

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test HTTP connection first (port 80)
echo -e "${YELLOW}Testing HTTP connection to port 80...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/ --max-time 5)
if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 302 ]; then
  echo -e "${GREEN}✅ VPN panel is accessible via HTTP on port 80 (status: $HTTP_STATUS)${NC}"
else
  echo -e "${YELLOW}⚠️ HTTP test on port 80 failed with status: $HTTP_STATUS${NC}"
fi

# Test HTTPS connection (port 443)
echo -e "\n${YELLOW}Testing HTTPS connection to port 443...${NC}"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k https://localhost:443/ --max-time 5)
if [ "$HTTPS_STATUS" -eq 200 ] || [ "$HTTPS_STATUS" -eq 302 ]; then
  echo -e "${GREEN}✅ VPN panel is accessible via HTTPS on port 443 (status: $HTTPS_STATUS)${NC}"
else
  echo -e "${YELLOW}⚠️ HTTPS test on port 443 failed with status: $HTTPS_STATUS${NC}"
fi

# Test HTTPS connection to panel port (54321)
echo -e "\n${YELLOW}Testing HTTPS connection to panel port 54321...${NC}"
PANEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k https://localhost:54321/ --max-time 5)
if [ "$PANEL_STATUS" -eq 200 ] || [ "$PANEL_STATUS" -eq 302 ]; then
  echo -e "${GREEN}✅ VPN panel is accessible via HTTPS on port 54321 (status: $PANEL_STATUS)${NC}"
else
  echo -e "${YELLOW}⚠️ Panel port 54321 test failed with status: $PANEL_STATUS${NC}"
fi

# Test HTTP connection to panel's internal port 2053 via docker
echo -e "\n${YELLOW}Testing internal HTTP connection to container port 2053...${NC}"
if command -v docker &> /dev/null; then
  CONTAINER_ID=$(docker ps --filter "name=xray-ui" --format "{{.ID}}")
  if [ ! -z "$CONTAINER_ID" ]; then
    INTERNAL_STATUS=$(docker exec $CONTAINER_ID wget -qO- --spider --server-response http://localhost:2053/ 2>&1 | awk '/HTTP\// {print $2}')
    if [ "$INTERNAL_STATUS" == "200" ] || [ "$INTERNAL_STATUS" == "302" ]; then
      echo -e "${GREEN}✅ VPN panel is accessible internally on port 2053 (status: $INTERNAL_STATUS)${NC}"
    else
      echo -e "${YELLOW}⚠️ Internal port 2053 test result: $INTERNAL_STATUS${NC}"
    fi
  else
    echo -e "${RED}❌ xray-ui container not found${NC}"
  fi
else
  echo -e "${YELLOW}⚠️ Docker command not available, skipping internal test${NC}"
fi

echo -e "\n${YELLOW}Summary:${NC}"
echo -e "HTTP Status (80): $HTTP_STATUS"
echo -e "HTTPS Status (443): $HTTPS_STATUS"
echo -e "Panel Status (54321): $PANEL_STATUS"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. If all tests failed, the VPN panel might not be running correctly"
echo "2. If only HTTPS tests failed, there might be SSL certificate issues"
echo "3. Check logs with: docker logs xray-ui"

exit 0 