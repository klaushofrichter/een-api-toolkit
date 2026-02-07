[**EEN API Toolkit v0.3.56**](../README.md)

***

[EEN API Toolkit](../README.md) / getRecordedImage

# Function: getRecordedImage()

> **getRecordedImage**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`RecordedImageResult`](../interfaces/RecordedImageResult.md)\>\>

Defined in: [src/media/service.ts:345](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/media/service.ts#L345)

Get a recorded image from a camera.

## Parameters

### params

[`GetRecordedImageParams`](../interfaces/GetRecordedImageParams.md)

Parameters including deviceId/pageToken and timestamp options

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`RecordedImageResult`](../interfaces/RecordedImageResult.md)\>\>

A Result containing the recorded image data or an error

## Remarks

Fetches a recorded image from the specified camera at a specific timestamp.
You can specify the desired timestamp using various operators (exact, gte, lte, etc.)
or use a pageToken from a previous request to navigate through images.

The image is returned as a base64 data URL that can be used directly in an HTML img element.

Note: The 'main' type is rate-limited and requires an actual recording at the timestamp.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getrecordedimage).

## Example

```typescript
import { getRecordedImage } from 'een-api-toolkit'

// Get image at or after a specific time
const { data, error } = await getRecordedImage({
  deviceId: 'camera-123',
  type: 'preview',
  timestamp__gte: '2024-01-15T10:00:00.000Z'
})

if (data) {
  imgElement.src = data.imageData
  console.log('Actual timestamp:', data.timestamp)

  // Get the next image using the token
  if (data.nextToken) {
    const { data: nextImage } = await getRecordedImage({
      pageToken: data.nextToken
    })
  }
}
```
