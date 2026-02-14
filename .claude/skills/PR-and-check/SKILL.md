---
name: PR-and-check
description: Use this skill when you are requested to create a PR for a feature branch to develop, or from develop to production.
---

# Instructions

## 1. Validate branch and sync state
- Fetch all remote refs and tags: `git fetch origin --tags`
- Check current branch: `git branch --show-current`
- Determine the PR flow:
  - If on `develop` → create PR to `production`
  - If on `production` → report error and stop (cannot create PR from production)
  - If on any other branch (feature branch) → create PR to `develop`
- Store the target branch for later use
- Check for in-progress release workflows:
  - run: `gh run list --workflow="Test Release" --status=in_progress --json databaseId,status --jq 'length'`
  - run: `gh run list --workflow="Publish Release" --status=in_progress --json databaseId,status --jq 'length'`
  - if either returns > 0, report that a release is in progress and stop (wait for it to complete before creating a new PR)

## 2. Check for existing PR
- Check if a PR already exists for this branch to the target:
  - `gh pr list --head <branch-name> --base <target-branch> --json number,url`
- If a PR exists, report the existing PR URL and skip to step 5 (code review)

## 3. Run tests locally
- Run linting first:
  - run: `npm run lint`
  - if linting fails, analyse the failure, report findings, and stop
- Run unit tests:
  - run: `npm test`
  - if tests fail, analyse the failure, report findings, and stop
- Run build to verify compilation:
  - run: `npm run build`
  - if build fails, analyse the failure, report findings, and stop
- Restart the OAuth proxy for E2E tests:
  - run: `./scripts/restart-proxy.sh`
  - verify proxy is running: `curl -s http://127.0.0.1:8787/health`
  - if proxy fails to start, report warning but continue (E2E OAuth tests will be skipped)
- Run E2E tests for all example apps (allow up to 20 minutes for all apps):
  - run: `npm run test:e2e:examples` (use a 20-minute bash timeout, e.g. `timeout 1200s npm run test:e2e:examples`)
  - this script discovers all example apps with playwright.config.ts, frees port 3333 between runs, and stops on first failure
  - if any E2E tests fail, analyse the failure, report findings, and stop
- Run security review:
  - invoke the `/security-review` skill to analyze code changes for security vulnerabilities
  - if any HIGH severity vulnerabilities are found with confidence >= 8, report findings and stop
  - include security review summary in the PR body
- Scan for confidential data leakage in documentation:
  - use the `docs-accuracy-reviewer` agent to scan all changed `.md` files for secrets, credentials, API keys, internal hostnames, email addresses, account IDs, or other confidential information that should not be in a public npm package
  - if any confidential data is found, report findings and stop

## 4. Create PR
- Get version number for the PR body:
  - `jq -r .version package.json`
- Get list of commits to include:
  - `git log origin/<target-branch>..HEAD --oneline`
- Create a well-formatted PR:
  - use `gh pr create --base <target-branch> --title "<title>" --body "<body>"` with a HEREDOC for the body
  - highlight the changes and the purpose of the branch
  - include test results summary and version number
- Capture the PR number from the output (needed for code review step)
  - the `gh pr create` command outputs the PR URL, extract the number from it

## 5. Monitor code review
- A code review using the workflow claude-code-review.yml was automatically triggered by the PR
- Verify the workflow started:
  - wait 5 seconds, then check: `gh run list --workflow=claude-code-review.yml --limit 1 --json databaseId,status,headBranch`
  - confirm the run is for the correct branch
  - if workflow failed to start, report error and stop
- Poll for completion (check once per minute, max 20 minutes total):
  - Use separate bash commands with `sleep 60 && gh run list --workflow=claude-code-review.yml --limit 1 --json databaseId,status,conclusion`
  - IMPORTANT: Do NOT use complex shell constructs like `for i in {1..20}` as they cause parse errors
  - Make sequential individual bash calls, checking the status after each one
  - If status is "completed", stop polling
- Check the result:
  - if the workflow did not finish within 20 minutes, report timeout and stop
  - view the review: `gh pr view <pr-number> --comments` or check the PR review file artifact
  - if the review includes recommendations to address before merging, summarize the recommendations and stop
  - if the review ended without critical recommendations, summarize the overall comments and stop

## 6. Check all PR status checks
- After code review completes, check all PR status checks (including non-required ones):
  - run: `gh pr checks <pr-number> --json name,state`
  - report the status of each check
  - if any check has state "FAILURE", report which check failed and investigate using:
    - `gh pr checks <pr-number> --json name,state,link` to get the link to the failed check
    - review the workflow logs to understand the failure
  - report any failed checks to the user, even if they are not required for merge
