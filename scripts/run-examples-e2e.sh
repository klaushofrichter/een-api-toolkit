#!/bin/bash

# Run E2E tests for all example apps sequentially
# Usage: ./scripts/run-examples-e2e.sh
#
# Discovers all example apps under ./examples/ that have a playwright.config.ts
# and runs their E2E tests one at a time. Since all apps use port 3333,
# the port is freed before each run. Exits immediately on first failure.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Discover example apps with playwright.config.ts
APPS=()
for dir in "$PROJECT_ROOT"/examples/*/; do
    if [[ -f "$dir/playwright.config.ts" ]]; then
        APPS+=("$dir")
    fi
done

if [[ ${#APPS[@]} -eq 0 ]]; then
    echo -e "${RED}Error: No example apps with playwright.config.ts found${NC}"
    exit 1
fi

echo -e "${GREEN}Found ${#APPS[@]} example apps to test${NC}"
echo ""

PASSED=0

for APP_DIR in "${APPS[@]}"; do
    APP_NAME=$(basename "$APP_DIR")
    echo -e "${YELLOW}[$((PASSED + 1))/${#APPS[@]}] Testing ${APP_NAME}...${NC}"

    # Free port 3333 before each run
    lsof -ti :3333 | xargs kill -9 2>/dev/null || true

    # Run E2E tests
    if ! (cd "$APP_DIR" && npm run test:e2e); then
        echo ""
        echo -e "${RED}FAILED: ${APP_NAME}${NC}"
        exit 1
    fi

    PASSED=$((PASSED + 1))
    echo -e "${GREEN}PASSED: ${APP_NAME}${NC}"
    echo ""
done

echo -e "${GREEN}All ${PASSED}/${#APPS[@]} example apps passed E2E tests${NC}"
