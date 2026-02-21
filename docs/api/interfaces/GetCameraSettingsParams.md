[**EEN API Toolkit v0.3.91**](../README.md)

***

[EEN API Toolkit](../README.md) / GetCameraSettingsParams

# Interface: GetCameraSettingsParams

Defined in: [types/camera.ts:428](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L428)

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

Defined in: [types/camera.ts:430](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L430)

Additional data to include: 'schema' and/or 'proposedValues'
