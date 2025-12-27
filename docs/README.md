# EEN API Toolkit Documentation

> **Current Version:** See [AI-CONTEXT.md](./AI-CONTEXT.md) for version

## Documentation Structure

### For AI Assistants

- **[AI-CONTEXT.md](./AI-CONTEXT.md)** - Single-file comprehensive reference optimized for AI assistants. Contains all API signatures, types, patterns, and examples in one parseable document.

### API Reference

- **[api/](./api/)** - Auto-generated API documentation from TypeDoc
  - Functions, types, and interfaces
  - Generated from JSDoc comments in source code

### Guides

- [Getting Started](./getting-started/) - Installation and setup
- [Guides](./guides/) - In-depth guides on specific topics

## Quick Links

| Topic | Description |
|-------|-------------|
| [AI-CONTEXT.md](./AI-CONTEXT.md) | Complete reference for AI-assisted development |
| [API Reference](./api/README.md) | Auto-generated API docs |
| [Example App](../examples/vue-basic/) | Complete Vue 3 example application |

## Versioning

Documentation is versioned alongside the package. Each release includes:

1. Updated `AI-CONTEXT.md` with current version and date
2. Regenerated API reference from TypeDoc
3. Tagged release in git

### Checking Documentation Version

The version is displayed at the top of `AI-CONTEXT.md`:

```markdown
> **Version:** 0.0.4
> **Generated:** 2024-01-15
```

### Generating Documentation

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
- [GitHub Repository](https://github.com/klaushofrichter/een-api-toolkit)

## Contributing to Documentation

1. **API Documentation**: Update JSDoc comments in source files, then run `npm run docs`
2. **AI-CONTEXT.md**: Edit `scripts/generate-ai-context.ts` for structure changes
3. **Guides**: Add markdown files to `docs/guides/`

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
