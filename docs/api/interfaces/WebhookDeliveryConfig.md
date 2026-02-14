[**EEN API Toolkit v0.3.79**](../README.md)

***

[EEN API Toolkit](../README.md) / WebhookDeliveryConfig

# Interface: WebhookDeliveryConfig

Defined in: [types/eventSubscription.ts:64](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L64)

Webhook delivery configuration.

## Remarks

Configuration for webhook delivery type.
The `secret` is provided by the server for signature verification.

## Properties

### type

> **type**: `"webhook.v1"`

Defined in: [types/eventSubscription.ts:66](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L66)

Delivery type identifier

***

### secret?

> `optional` **secret**: `string`

Defined in: [types/eventSubscription.ts:68](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L68)

Base64 encoded secret for signature verification (read-only)
