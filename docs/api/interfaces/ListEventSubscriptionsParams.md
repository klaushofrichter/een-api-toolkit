[**EEN API Toolkit v0.3.43**](../README.md)

***

[EEN API Toolkit](../README.md) / ListEventSubscriptionsParams

# Interface: ListEventSubscriptionsParams

Defined in: [src/types/eventSubscription.ts:281](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L281)

Parameters for listing event subscriptions.

## Remarks

Supports pagination via pageSize and pageToken.

## Example

```typescript
import { listEventSubscriptions } from 'een-api-toolkit'

// Get first page
const { data } = await listEventSubscriptions({ pageSize: 10 })

// Get next page
if (data?.nextPageToken) {
  const { data: page2 } = await listEventSubscriptions({
    pageSize: 10,
    pageToken: data.nextPageToken
  })
}
```

## Properties

### pageSize?

> `optional` **pageSize**: `number`

Defined in: [src/types/eventSubscription.ts:283](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L283)

Number of results per page

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/eventSubscription.ts:285](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L285)

Token for fetching a specific page
