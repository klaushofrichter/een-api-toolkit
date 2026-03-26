[**EEN API Toolkit v0.3.105**](../README.md)

***

[EEN API Toolkit](../README.md) / EventSubscriptionLifecycle

# Type Alias: EventSubscriptionLifecycle

> **EventSubscriptionLifecycle** = `"temporary"` \| `"persistent"`

Defined in: [types/eventSubscription.ts:10](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L10)

Subscription lifecycle type.

## Remarks

- `temporary`: Removed when deleted or when no client uses it for timeToLiveSeconds
- `persistent`: Remains active indefinitely until explicitly deleted
