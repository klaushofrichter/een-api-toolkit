[**EEN API Toolkit v0.3.83**](../README.md)

***

[EEN API Toolkit](../README.md) / Bridge

# Interface: Bridge

Defined in: [types/bridge.ts:108](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L108)

Bridge entity from EEN API v3.0.

## Remarks

Represents a bridge in the Eagle Eye Networks platform. Bridges are
physical devices that connect cameras to the cloud. They aggregate
video streams from multiple cameras and provide network connectivity.

For more details on bridge management, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listbridges).

## Example

```typescript
import { getBridges, type Bridge } from 'een-api-toolkit'

const { data, error } = await getBridges({ include: ['status'] })
if (data) {
  data.results.forEach((bridge: Bridge) => {
    console.log(`${bridge.name}: ${bridge.status}`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [types/bridge.ts:110](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L110)

Unique identifier for the bridge

***

### name

> **name**: `string`

Defined in: [types/bridge.ts:112](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L112)

Display name of the bridge

***

### accountId

> **accountId**: `string`

Defined in: [types/bridge.ts:114](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L114)

ID of the account this bridge belongs to

***

### locationId?

> `optional` **locationId**: `string` \| `null`

Defined in: [types/bridge.ts:116](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L116)

ID of the location where the bridge is installed

***

### guid?

> `optional` **guid**: `string`

Defined in: [types/bridge.ts:118](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L118)

Globally unique identifier

***

### timezone?

> `optional` **timezone**: `string`

Defined in: [types/bridge.ts:120](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L120)

Timezone of the bridge location (IANA timezone name)

***

### status?

> `optional` **status**: [`BridgeStatus`](../type-aliases/BridgeStatus.md) \| \{ `connectionStatus?`: BridgeStatus \| undefined; \}

Defined in: [types/bridge.ts:128](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L128)

Current status of the bridge.

#### Remarks

The API may return status as either a string or an object
depending on the `include` parameters.

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [types/bridge.ts:130](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L130)

Tags assigned to this bridge for organization

***

### deviceInfo?

> `optional` **deviceInfo**: [`BridgeDeviceInfo`](BridgeDeviceInfo.md)

Defined in: [types/bridge.ts:132](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L132)

Device information (make, model, firmware)

***

### networkInfo?

> `optional` **networkInfo**: [`BridgeNetworkInfo`](BridgeNetworkInfo.md)

Defined in: [types/bridge.ts:134](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L134)

Network information (IP addresses, MAC)

***

### devicePosition?

> `optional` **devicePosition**: [`BridgeDevicePosition`](BridgeDevicePosition.md)

Defined in: [types/bridge.ts:136](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L136)

Physical position of the bridge

***

### cameraCount?

> `optional` **cameraCount**: `number`

Defined in: [types/bridge.ts:138](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L138)

Number of cameras connected to this bridge

***

### createdAt?

> `optional` **createdAt**: `string`

Defined in: [types/bridge.ts:140](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L140)

ISO 8601 timestamp when the bridge was created

***

### updatedAt?

> `optional` **updatedAt**: `string`

Defined in: [types/bridge.ts:142](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/bridge.ts#L142)

ISO 8601 timestamp when the bridge was last updated
