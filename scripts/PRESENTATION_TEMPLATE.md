---
title: EEN API Toolkit - Repository Overview
description: A comprehensive presentation covering the architecture, API design, testing, and CI/CD of the EEN API Toolkit project
marp: true
theme: default
size: 16:9
transition: none
paginate: true
style: |
  section {
    font-size: 20px;
    padding: 30px;
  }
  h1 { font-size: 40px; color: #1a73e8; }
  h2 { font-size: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
  table { font-size: 18px; width: 100%; }
  code { font-size: 0.85em; }
  h1, h2 { text-overflow: ellipsis; white-space: nowrap; overflow: hidden; }
---

# EEN API Toolkit
## Repository Overview & Architecture Analysis

[GitHub Repository]({{REPO_URL}})

---

# Core Functionality

**What does this software do?**

- **TypeScript Library**: Implements Eagle Eye Networks Video platform API v3.0
- **Vue 3 Integration**: Designed for Vue 3 Composition API applications
- **Authentication Management**:
  - Pinia-based auth store for state management
  - OAuth flow integration with proxy server
  - Automatic token refresh handling
- **API Services**: Plain async functions for API calls (`getUsers()`, `getCameras()`, etc.)
- **Type Safety**: Full TypeScript types generated from OpenAPI spec
- **Published to npm**: Available as `een-api-toolkit` package

---

# Software Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Eagle Eye Networks                              │
│                         (OAuth Provider & Video API)                         │
└───────────────────────────────────▲─────────────────────────────────────────┘
                                    │
                                    │ HTTPS (API v3.0)
                                    │
┌───────────────────────────────────┴─────────────────────────────────────────┐
│                     OAuth Proxy (een-oauth-proxy)                            │
│  - Stores CLIENT_SECRET and refresh tokens server-side                       │
│  - Handles token exchange and refresh                                        │
└───────────────────────────────────▲─────────────────────────────────────────┘
                                    │
                                    │
┌───────────────────────────────────┴─────────────────────────────────────────┐
│                        een-api-toolkit (This Library)                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │    Auth Store    │  │   API Services   │  │    Type Definitions      │   │
│  │  - useAuthStore  │  │  - getUsers()    │  │  - User, Camera, Bridge  │   │
│  │  - initToolkit   │  │  - getCameras()  │  │  - EenError, Result<T>   │   │
│  │  - handleAuth    │  │  - getBridges()  │  │  - API response types    │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘   │
└───────────────────────────────────▲─────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
     ┌──────┴──────┐         ┌──────┴──────┐         ┌──────┴──────┐
     │  Vue 3 App  │         │  Vue 3 App  │         │  Vue 3 App  │
     │  (Example)  │         │  (External) │         │   (Your)    │
     └─────────────┘         └─────────────┘         └─────────────┘
```

---

# Repository Structure

```
een-api-toolkit/
├── src/                      # Source code
│   ├── auth/                # Authentication: Pinia store + auth service
│   ├── users/               # User API service functions
│   ├── cameras/             # Camera API service functions
│   ├── bridges/             # Bridge API service functions
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions (debug, etc.)
│   ├── config.ts            # Toolkit configuration
│   └── index.ts             # Single entry point export
├── examples/                 # Example applications
│   └── vue-users/           # Complete Vue 3 example
├── e2e/                      # Playwright E2E tests
├── docs/                     # Documentation
│   ├── AI-CONTEXT.md        # AI-friendly reference (auto-generated)
│   ├── api/                 # TypeDoc API reference
│   └── guides/              # In-depth guides
├── scripts/                  # Build & utility scripts
├── .github/workflows/        # CI/CD pipelines
└── package.json              # Package configuration
```

---

# Branches & GitHub Actions

**Branch Management Strategy**

- **`develop`**: Integration testing branch - all feature work merges here
- **`production`**: Release branch for well-tested packages
- **Flow**: `feature/*` → `develop` → `production`

**Branch Protection Rules (production):**
- Direct pushes blocked - PRs required
- Required status checks:
  - Claude AI code reviews
  - Lint, typecheck, and tests
- Automatic branch sync after merges

---

# GitHub Actions Workflows

| Workflow | Trigger | Function |
|----------|---------|----------|
| `claude-code-review.yml` | PR open/sync | Claude AI code review |
| `claude.yml` | @claude mention | Interactive Claude assistance |
| `test-release.yml` | PR to production | Run lint, tests, build |
| `npm-publish.yml` | After test-release | Publish to npm registry |
| `sync-develop.yml` | PR merged | Syncs production → develop |

**Automation Features:**
- Automatic CHANGELOG generation from PRs
- GitHub Release creation with tarball
- Slack notifications on publish
- Husky pre-commit hooks for version bumping

---

# Testing Strategy

**Multi-layer testing approach:**

**Unit Tests - Vitest:**
- Auth store functionality
- API service functions
- Configuration handling
- Error handling patterns

**E2E Tests - Playwright:**
- Complete OAuth flow
- API integration tests
- Example application tests

**Running Tests:**
```bash
npm test              # Run unit tests
npm run test:e2e      # Run Playwright E2E tests
npm run test:e2e:ui   # Playwright UI mode
npm run lint          # ESLint checks
npm run typecheck     # TypeScript validation
```

---

# API Design Pattern

**Result Objects (Never Throw):**

```typescript
async function getUsers(): Promise<Result<UsersResponse>> {
  // Returns { data, error } - never throws
  if (!authStore.isAuthenticated) {
    return { data: null, error: { code: 'AUTH_REQUIRED', message: '...' } }
  }

  try {
    const response = await fetch(url, { headers })
    if (!response.ok) {
      return { data: null, error: { code: 'API_ERROR', message: '...' } }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: { code: 'NETWORK_ERROR', message: '...' } }
  }
}
```

**Usage in Components:**
```typescript
const { data, error } = await getUsers()
if (error) {
  // Handle error gracefully
} else {
  // Use data safely
}
```

---

# Security Measures

**Defensive Architecture:**

| Layer | Protection |
|-------|-----------|
| Token Storage | Access token only client-side, refresh token server-side |
| Proxy Isolation | CLIENT_SECRET never exposed to browser |
| Input Validation | All API parameters validated |
| Error Handling | No sensitive data in error messages |
| Type Safety | TypeScript strict mode prevents type errors |

**Security Design Principles:**
- Refresh tokens stored only in OAuth proxy (Cloudflare KV)
- Client receives session ID, not refresh token
- Auto-refresh triggers before token expiration
- All API calls authenticated via Bearer token

---

# Security - Development Process Guards

**Automated Security Measures:**
- **Claude AI Review**: Security-focused code analysis on every PR
- **TypeScript Strict Mode**: Catches potential type-related bugs
- **ESLint**: Code quality and security best practices
- **Husky Hooks**: Pre-commit validation

**Dependency Management:**
- Regular dependency audits
- Latest stable versions policy
- TypeScript pinned for API Extractor compatibility

**Code Review Process:**
- All changes require PR review
- AI-assisted review for security issues
- Branch protection prevents unverified code

---

# Documentation Structure

| Location | Content |
|----------|---------|
| `docs/AI-CONTEXT.md` | Complete AI-friendly reference (auto-generated) |
| `docs/api/` | TypeDoc API reference (auto-generated) |
| `docs/guides/` | In-depth implementation guides |
| `docs/getting-started/` | Setup and installation guides |
| `examples/vue-users/` | Working Vue 3 example application |
| `CLAUDE.md` | Claude Code instructions |
| `CHANGELOG.md` | Version history |

**Documentation Generation:**
```bash
npm run docs              # Generate all documentation
npm run docs:api          # TypeDoc API reference
npm run docs:ai-context   # AI-CONTEXT.md generation
```

---

# Recommended Improvements

**API Coverage:**
1. Implement remaining EEN API endpoints (events, media, etc.)
2. Add POST/PUT/DELETE operations (currently GET-focused)
3. Add streaming support for video endpoints

**Testing:**
1. Increase unit test coverage
2. Add integration tests with mock EEN server
3. Add performance benchmarks

**Developer Experience:**
1. Add Vue composables for common patterns
2. Create React adapter package
3. Add request/response interceptors

**Documentation:**
1. Add interactive API playground
2. Create video tutorials
3. Add migration guides

---

# Key Packages & Dependencies

**Runtime (Peer Dependencies):**
| Package | Version | Purpose |
|---------|---------|---------|
| `vue` | ^3.3.0 | Reactive UI framework |
| `pinia` | ^3.0.0 | State management |

**Build & Development:**
| Package | Version | Purpose |
|---------|---------|---------|
| `vite` | 7.x | Build tool & dev server |
| `typescript` | ~5.8 | Type-safe JavaScript |
| `vite-plugin-dts` | 4.x | TypeScript declaration generation |
| `vitest` | 4.x | Unit testing framework |
| `@playwright/test` | 1.57 | E2E testing |
| `typedoc` | 0.28 | API documentation |
| `eslint` | 9.x | Code linting |

---

# Package Configuration

**npm Package Exports:**
```typescript
// Plain async functions
import { getUsers, getUser, getCameras, getCamera } from 'een-api-toolkit'

// Auth store and helpers
import { useAuthStore, initEenToolkit, handleAuthCallback } from 'een-api-toolkit'

// Types
import type { User, Camera, EenError, Result } from 'een-api-toolkit'
```

**Build Outputs:**
- `dist/index.js` - ES Module
- `dist/index.cjs` - CommonJS
- `dist/index.d.ts` - TypeScript declarations

---

# Summary

**EEN API Toolkit** is a production-ready TypeScript library featuring:

- **Clean API Design**: Plain async functions, never-throw pattern
- **Vue 3 Integration**: Pinia store for auth state management
- **Type Safety**: Full TypeScript types from OpenAPI spec
- **Secure Architecture**: Proxy-based token management
- **Automated CI/CD**: AI review, testing, npm publishing
- **Comprehensive Docs**: Auto-generated API reference and AI context

**Repository:** [{{REPO_URL}}]({{REPO_URL}})

---

# Questions?

**Resources:**
- GitHub Repository: [{{REPO_URL}}]({{REPO_URL}})
- npm Package: [npmjs.com/package/een-api-toolkit](https://npmjs.com/package/een-api-toolkit)
- Eagle Eye Networks: [developer.eagleeyenetworks.com](https://developer.eagleeyenetworks.com/)

**Getting Started:**
```bash
npm install een-api-toolkit
```

**Contact:**
- Open an issue on GitHub for questions or feedback
