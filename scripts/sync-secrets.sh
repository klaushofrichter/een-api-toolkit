#!/bin/bash

# Sync .env file to GitHub repository secrets and example applications
# Usage: ./scripts/sync-secrets.sh [--dry-run]
#
# This script:
#   1. Syncs secrets from root .env to GitHub repository secrets
#   2. Copies VITE_* variables from root .env to examples/*/.env
#
# Requires:
#   - gh CLI installed and authenticated
#   - .env file in project root

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"
EXAMPLES_DIR="$PROJECT_ROOT/examples"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}Dry run mode - no changes will be made${NC}"
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

# ============================================================
# Part 2: Sync .env to example applications
# ============================================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Syncing .env to example applications${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Variables to copy to examples (subset of root .env)
EXAMPLE_VARS=(
    "VITE_PROXY_URL"
    "VITE_EEN_CLIENT_ID"
    "VITE_DEBUG"
    "TEST_USER"
    "TEST_PASSWORD"
)

# Find all example directories that have a .env.example file
example_count=0
for example_dir in "$EXAMPLES_DIR"/*/; do
    if [[ -f "${example_dir}.env.example" ]]; then
        example_name=$(basename "$example_dir")
        target_env="${example_dir}.env"

        echo -e "Example: ${BLUE}$example_name${NC}"

        # Build the .env content
        env_content="# Auto-generated from root .env by sync-secrets.sh\n"
        env_content+="# Do not edit - changes will be overwritten\n"
        env_content+="# Source: $(date)\n\n"

        for var in "${EXAMPLE_VARS[@]}"; do
            value=$(grep -E "^${var}=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
            if [[ -n "$value" ]]; then
                env_content+="${var}=${value}\n"
                echo -e "  ${GREEN}✓${NC} $var"
            else
                echo -e "  ${YELLOW}○${NC} $var (not set in root .env)"
            fi
        done

        # Add VITE_REDIRECT_URI with default value
        env_content+="\n# OAuth redirect URI (required - do not change)\n"
        env_content+="VITE_REDIRECT_URI=http://127.0.0.1:3333\n"
        echo -e "  ${GREEN}✓${NC} VITE_REDIRECT_URI (default)"

        if [[ "$DRY_RUN" == true ]]; then
            echo -e "  ${YELLOW}Would write:${NC} $target_env"
        else
            echo -e "$env_content" > "$target_env"
            echo -e "  ${GREEN}Written:${NC} $target_env"
        fi

        ((example_count++))
        echo ""
    fi
done

echo "Examples synced: $example_count"

if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo "Run without --dry-run to apply changes"
fi
