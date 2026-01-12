[**EEN API Toolkit v0.3.11**](../README.md)

***

[EEN API Toolkit](../README.md) / StorageStrategy

# Type Alias: StorageStrategy

> **StorageStrategy** = `"localStorage"` \| `"sessionStorage"` \| `"memory"`

Defined in: [src/types/common.ts:152](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L152)

Storage strategy options for token persistence.

## Remarks

Different storage strategies offer different security/convenience tradeoffs:

- **localStorage**: Tokens persist across browser sessions. Most convenient but
  vulnerable to XSS attacks since JavaScript can access localStorage.

- **sessionStorage**: Tokens persist within a single tab session. Cleared when
  the tab is closed. Each tab has isolated storage, so opening a new tab
  requires re-authentication.

- **memory**: Tokens are only kept in memory (Pinia store). Most secure as
  tokens are never written to disk, but any page refresh requires re-authentication.
