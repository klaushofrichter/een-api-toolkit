[**EEN API Toolkit v0.3.94**](../README.md)

***

[EEN API Toolkit](../README.md) / GetCameraSettingsParams

# Interface: GetCameraSettingsParams

Defined in: [types/camera.ts:440](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L440)

Parameters for getting camera settings.

## Remarks

Controls what additional data is returned with camera settings.

## Example

```typescript
import { getCameraSettings } from 'een-api-toolkit'

const { data } = await getCameraSettings('camera-123', {
  include: ['schema', 'proposedValues']
})
```

## Properties

### include?

> `optional` **include**: [`CameraSettingsInclude`](../type-aliases/CameraSettingsInclude.md)[]

Defined in: [types/camera.ts:442](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L442)

Additional data to include: 'schema' and/or 'proposedValues'
