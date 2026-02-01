[**EEN API Toolkit v0.3.48**](../README.md)

***

[EEN API Toolkit](../README.md) / WebhookDeliveryConfigCreate

# Interface: WebhookDeliveryConfigCreate

Defined in: [src/types/eventSubscription.ts:201](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L201)

Webhook delivery configuration for creation.

## Remarks

Used when creating a subscription with webhook delivery.

## Properties

### type

> **type**: `"webhook.v1"`

Defined in: [src/types/eventSubscription.ts:203](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L203)

Delivery type identifier

***

### webhookUrl

> **webhookUrl**: `string`

Defined in: [src/types/eventSubscription.ts:205](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L205)

HTTPS URL where webhook events will be sent

***

### technicalContactEmail

> **technicalContactEmail**: `string`

Defined in: [src/types/eventSubscription.ts:207](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L207)

Email address of technical contact

***

### technicalContactName

> **technicalContactName**: `string`

Defined in: [src/types/eventSubscription.ts:209](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/eventSubscription.ts#L209)

Name of technical contact
