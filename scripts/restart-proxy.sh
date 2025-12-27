#!/bin/bash

# Restart the local OAuth proxy server
# Usage: ./scripts/restart-proxy.sh
#
# Starts the proxy from ../een-oauth-proxy/proxy on port 8787

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROXY_DIR="$(dirname "$SCRIPT_DIR")/../een-oauth-proxy/proxy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if proxy directory exists
if [[ ! -d "$PROXY_DIR" ]]; then
    echo -e "${RED}Error: Proxy directory not found at $PROXY_DIR${NC}"
    exit 1
fi

# Kill existing proxy on port 8787
if lsof -ti :8787 > /dev/null 2>&1; then
    echo -e "${YELLOW}Stopping existing proxy on port 8787...${NC}"
    kill $(lsof -ti :8787) 2>/dev/null || true
    sleep 1
fi

# Start the proxy
echo -e "${GREEN}Starting proxy from $PROXY_DIR...${NC}"
cd "$PROXY_DIR"
npm run dev &

# Wait for proxy to start
echo "Waiting 5 seconds for proxy to start..."
sleep 5

# Verify proxy is running
if lsof -ti :8787 > /dev/null 2>&1; then
    echo -e "${GREEN}Proxy is running on http://localhost:8787${NC}"
else
    echo -e "${RED}Warning: Proxy may not have started correctly${NC}"
    exit 1
fi
