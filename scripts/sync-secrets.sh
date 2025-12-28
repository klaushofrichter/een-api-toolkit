#!/bin/bash

# Sync .env file to GitHub repository secrets
# Usage: ./scripts/sync-secrets.sh [--dry-run]
#
# Requires:
#   - gh CLI installed and authenticated
#   - .env file in project root

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}Dry run mode - no secrets will be set${NC}"
    echo ""
fi

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: gh CLI is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: gh CLI is not authenticated${NC}"
    echo "Run: gh auth login"
    exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    echo "Copy .env.example to .env and fill in your values"
    exit 1
fi

# Get repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [[ -z "$REPO" ]]; then
    echo -e "${RED}Error: Not in a GitHub repository or cannot determine repo${NC}"
    exit 1
fi

echo "Repository: $REPO"
echo "Reading secrets from: $ENV_FILE"
echo ""

# Secrets to sync (add more as needed)
# Format: ENV_VAR_NAME:GITHUB_SECRET_NAME
# If GITHUB_SECRET_NAME is omitted, ENV_VAR_NAME is used
SECRETS_TO_SYNC=(
    "ANTHROPIC_API_KEY"
    "CLIENT_SECRET"
    "NPM_TOKEN"
    "SLACK_WEBHOOK"
    "TEST_PASSWORD"
    "TEST_USER"
    "VITE_EEN_CLIENT_ID"
    "VITE_PROXY_URL"
)

# Parse .env file and set secrets
success_count=0
skip_count=0
error_count=0

for secret_spec in "${SECRETS_TO_SYNC[@]}"; do
    # Parse secret spec (ENV_VAR:GITHUB_NAME or just ENV_VAR)
    IFS=':' read -r env_var github_name <<< "$secret_spec"
    github_name="${github_name:-$env_var}"

    # Extract value from .env file (handles quotes)
    value=$(grep -E "^${env_var}=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

    if [[ -z "$value" ]]; then
        echo -e "${YELLOW}Skip:${NC} $github_name (not set in .env)"
        ((skip_count++))
        continue
    fi

    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${GREEN}Would set:${NC} $github_name = ${value:0:10}..."
    else
        if echo "$value" | gh secret set "$github_name" --repo "$REPO"; then
            echo -e "${GREEN}Set:${NC} $github_name"
            ((success_count++))
        else
            echo -e "${RED}Error:${NC} Failed to set $github_name"
            ((error_count++))
        fi
    fi
done

echo ""
echo "Summary:"
echo -e "  ${GREEN}Set:${NC} $success_count"
echo -e "  ${YELLOW}Skipped:${NC} $skip_count"
if [[ $error_count -gt 0 ]]; then
    echo -e "  ${RED}Errors:${NC} $error_count"
fi

if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo "Run without --dry-run to actually set the secrets"
fi
