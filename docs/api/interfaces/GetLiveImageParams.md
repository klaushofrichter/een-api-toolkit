[**EEN API Toolkit v0.2.1**](../README.md)

***

[EEN API Toolkit](../README.md) / GetLiveImageParams

# Interface: GetLiveImageParams

Defined in: [src/types/media.ts:133](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L133)

Parameters for getting a live image.

## Remarks

Used to fetch a live image from a camera.
Note: Live images only support 'preview' type.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getliveimage).

## Example

```typescript
import { getLiveImage } from 'een-api-toolkit'

const { data } = await getLiveImage({
  deviceId: 'camera-123',
  type: 'preview'
})

if (data) {
  // Display the image in an <img> element
  imgElement.src = data.imageData
}
```

## Properties

### deviceId

> **deviceId**: `string`

Defined in: [src/types/media.ts:135](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L135)

The ID of the device (camera) - required

***

### type?

> `optional` **type**: `"preview"`

Defined in: [src/types/media.ts:137](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L137)

Stream type - only 'preview' is supported for live images
