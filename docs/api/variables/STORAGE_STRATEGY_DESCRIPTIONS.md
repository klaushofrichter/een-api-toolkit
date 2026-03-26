[**EEN API Toolkit v0.3.105**](../README.md)

***

[EEN API Toolkit](../README.md) / STORAGE\_STRATEGY\_DESCRIPTIONS

# Variable: STORAGE\_STRATEGY\_DESCRIPTIONS

> `const` **STORAGE\_STRATEGY\_DESCRIPTIONS**: `Record`\<[`StorageStrategy`](../type-aliases/StorageStrategy.md), `string`\>

Defined in: [utils/storage.ts:23](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/utils/storage.ts#L23)

Human-readable descriptions for each storage strategy.
Useful for displaying storage information in UI components.

## Example

```typescript
import { getStorageStrategy, STORAGE_STRATEGY_DESCRIPTIONS } from 'een-api-toolkit'

const strategy = getStorageStrategy()
const description = STORAGE_STRATEGY_DESCRIPTIONS[strategy]
console.log(`Using ${strategy}: ${description}`)
```
