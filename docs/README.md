# EEN API Toolkit Documentation

> **Current Version:** See [AI-CONTEXT.md](./AI-CONTEXT.md) for version

## Documentation Overview

| Document | Audience | Description |
|----------|----------|-------------|
| **[User Guide](./USER-GUIDE.md)** | App Developers | Installation, proxy setup, authentication, API usage |
| **[Developer Guide](./DEVELOPER-GUIDE.md)** | Contributors | Architecture, testing, CI/CD, publishing |
| **[API Reference](./api/)** | All | Auto-generated TypeDoc documentation |
| **[AI-CONTEXT.md](./AI-CONTEXT.md)** | AI Assistants | Single-file comprehensive reference |
| **[Example Apps](../examples/)** | All | Complete Vue 3 example applications |

## For App Developers

Start with the **[User Guide](./USER-GUIDE.md)** which covers:

- Prerequisites and installation
- OAuth proxy setup (using [een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy))
- Configuration options
- Authentication flow implementation
- Using API functions
- Error handling patterns
- Building an app from scratch
- Troubleshooting common issues

## For Contributors

See the **[Developer Guide](./DEVELOPER-GUIDE.md)** which covers:

- Development environment setup
- Architecture and security model
- Code structure and patterns
- Adding new API resources
- Unit and E2E testing
- Build system (Vite library mode)
- CI/CD workflows
- Publishing to npm
- Contributing guidelines

## API Reference

The **[API Reference](./api/)** is auto-generated from JSDoc comments using TypeDoc:

- All exported functions
- TypeScript types and interfaces
- Usage examples

Regenerate with:

```bash
npm run docs:api
```

## For AI Assistants

**[AI-CONTEXT.md](./AI-CONTEXT.md)** provides a single-file comprehensive reference optimized for AI-assisted development:

- All API signatures and types
- Code patterns and examples
- Configuration options
- Error codes

Regenerate with:

```bash
npm run docs:ai-context
```

## Documentation Versioning

Documentation is versioned alongside the package. Each release includes:

1. Updated `AI-CONTEXT.md` with current version and date
2. Regenerated API reference from TypeDoc
3. Tagged release in git

### Generating All Documentation

```bash
# Generate all documentation
npm run docs

# Generate only API reference (TypeDoc)
npm run docs:api

# Generate only AI-CONTEXT.md
npm run docs:ai-context
```

## External Resources

- [Eagle Eye Networks Developer Portal](https://developer.eagleeyenetworks.com)
- [EEN API v3.0 Reference](https://developer.eagleeyenetworks.com/reference/using-the-api)
- [een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy) - OAuth proxy server
- [GitHub Repository](https://github.com/klaushofrichter/een-api-toolkit)

## Contributing to Documentation

1. **User/Developer Guides**: Edit markdown files directly
2. **API Documentation**: Update JSDoc comments in source files, then run `npm run docs`
3. **AI-CONTEXT.md**: Edit `scripts/generate-ai-context.ts` for structure changes

### JSDoc Best Practices

```typescript
/**
 * Brief description of the function.
 *
 * @remarks
 * Detailed explanation and context.
 *
 * @param paramName - Description of parameter
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * // Complete, runnable example
 * const result = myFunction()
 * ```
 *
 * @category CategoryName
 */
```
