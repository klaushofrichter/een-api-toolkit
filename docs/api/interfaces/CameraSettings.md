[**EEN API Toolkit v0.3.89**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettings

# Interface: CameraSettings

Defined in: [types/camera.ts:659](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L659)

Top-level camera settings response from EEN API v3.0.

## Remarks

The response wraps `CameraSettingsData` in a `data` property.
Optionally includes `schema` (JSON Schema) and `proposedValues`
when requested via the `include` query parameter.

## Example

```typescript
import { getCameraSettings, type CameraSettings } from 'een-api-toolkit'

const { data, error } = await getCameraSettings('camera-123', {
  include: ['schema', 'proposedValues']
})
if (data) {
  console.log('Settings:', data.data)
  console.log('Schema:', data.schema)
  console.log('Proposed values:', data.proposedValues)
}
```

## Properties

### data

> **data**: [`CameraSettingsData`](CameraSettingsData.md)

Defined in: [types/camera.ts:661](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L661)

The camera settings data

***

### schema?

> `optional` **schema**: `object`

Defined in: [types/camera.ts:663](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L663)

JSON Schema describing all settings fields (when include contains 'schema')

***

### proposedValues?

> `optional` **proposedValues**: `object`

Defined in: [types/camera.ts:665](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L665)

Proposed/recommended values (when include contains 'proposedValues')
