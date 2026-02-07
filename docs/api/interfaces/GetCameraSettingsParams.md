[**EEN API Toolkit v0.3.63**](../README.md)

***

[EEN API Toolkit](../README.md) / GetCameraSettingsParams

# Interface: GetCameraSettingsParams

Defined in: [src/types/camera.ts:421](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L421)

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

Defined in: [src/types/camera.ts:423](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L423)

Additional data to include: 'schema' and/or 'proposedValues'
