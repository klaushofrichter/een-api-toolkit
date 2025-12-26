---
name: PR-and-check
description: Use this skill when you are requested to create a PR for a feature branch.
---

# Instructions

## 1. Validate branch
- Verify we're on a feature branch (not `develop` or `production`)
  - check current branch: `git branch --show-current`
  - if on `develop` or `production`, report error and stop

## 2. Check for existing PR
- Check if a PR already exists for this branch: `gh pr list --head <branch-name> --json number,url`
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

## 4. Create PR
- Get version number for the PR body:
  - `jq -r .version package.json`
- Create a well-formatted PR from the feature branch to develop:
  - use `gh pr create --base develop --title "<title>" --body "<body>"` with a HEREDOC for the body
  - highlight the changes and the purpose of the feature branch
  - include test results summary and version number
- Capture the PR number from the output (needed for code review step)
  - the `gh pr create` command outputs the PR URL, extract the number from it

## 5. Monitor code review
- A code review using the workflow pr-review.yml was automatically triggered by the PR
- Verify the workflow started:
  - wait 5 seconds, then check: `gh run list --workflow=pr-review.yml --limit 1 --json databaseId,status,headBranch`
  - confirm the run is for the correct branch
  - if workflow failed to start, report error and stop
- Poll for completion (check once per minute, max 10 minutes total):
  - `gh run list --workflow=pr-review.yml --limit 1 --json databaseId,status,conclusion`
- Check the result:
  - if the workflow did not finish within 10 minutes, report timeout and stop
  - view the review: `gh pr view <pr-number> --comments` or check the PR review file artifact
  - if the review includes recommendations to address before merging, summarize the recommendations and stop
  - if the review ended without critical recommendations, summarize the overall comments and stop
