#!/bin/bash

# Cleanup authentication state after E2E tests
# Usage: ./scripts/cleanup-auth.sh
#
# This script:
# 1. Revokes the access token via the proxy
# 2. Removes the cached auth state file
#
# Run this after E2E tests to ensure tokens are not left on disk.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AUTH_FILE="$PROJECT_ROOT/e2e/.auth-state.json"

# Load environment variables (line-by-line: avoids word-splitting, shell
# expansion of values, and leaking secrets through xargs process arguments)
if [[ -f "$PROJECT_ROOT/.env" ]]; then
    while IFS='=' read -r key value; do
        [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
        # Strip optional surrounding quotes
        value="${value%\"}"; value="${value#\"}"
        value="${value%\'}"; value="${value#\'}"
        export "$key=$value"
    done < "$PROJECT_ROOT/.env"
fi

PROXY_URL="${VITE_PROXY_URL:-http://localhost:8787}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if auth file exists
if [[ ! -f "$AUTH_FILE" ]]; then
    echo -e "${YELLOW}No auth state file found at $AUTH_FILE${NC}"
    echo "Nothing to clean up."
    exit 0
fi

echo "Found auth state file: $AUTH_FILE"

# Read session ID from auth file
SESSION_ID=$(jq -r '.sessionId // empty' "$AUTH_FILE" 2>/dev/null)

if [[ -n "$SESSION_ID" ]]; then
    echo "Revoking token via proxy..."

    # Attempt to revoke the token
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "$PROXY_URL/proxy/revoke" \
        -H "Authorization: Bearer $SESSION_ID" \
        -H "Origin: http://127.0.0.1:3333" \
        2>/dev/null) || true

    if [[ "$HTTP_STATUS" == "200" ]]; then
        echo -e "${GREEN}Token revoked successfully${NC}"
    elif [[ "$HTTP_STATUS" == "000" ]]; then
        echo -e "${YELLOW}Warning: Could not connect to proxy at $PROXY_URL${NC}"
        echo "Token may still be valid until it expires."
    else
        echo -e "${YELLOW}Warning: Token revocation returned status $HTTP_STATUS${NC}"
        echo "Token may still be valid until it expires."
    fi
else
    echo -e "${YELLOW}No session ID found in auth file${NC}"
fi

# Remove the auth file
echo "Removing auth state file..."
rm -f "$AUTH_FILE"
echo -e "${GREEN}Auth state file removed${NC}"

echo ""
echo "Cleanup complete."
