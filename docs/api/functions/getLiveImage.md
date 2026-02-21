[**EEN API Toolkit v0.3.88**](../README.md)

***

[EEN API Toolkit](../README.md) / getLiveImage

# Function: getLiveImage()

> **getLiveImage**(`params`): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`LiveImageResult`](../interfaces/LiveImageResult.md)\>\>

Defined in: [media/service.ts:235](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/media/service.ts#L235)

Get a live image from a camera.

## Parameters

### params

[`GetLiveImageParams`](../interfaces/GetLiveImageParams.md)

Parameters including the required deviceId

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`LiveImageResult`](../interfaces/LiveImageResult.md)\>\>

A Result containing the live image data or an error

## Remarks

Fetches a new live image from the specified camera. This call waits until
a new image is available from the device. The image is returned as a
base64 data URL that can be used directly in an HTML img element.

Note: Live images only support the 'preview' stream type.

**Memory Considerations**: Images are loaded into memory and base64 encoded,
adding ~33% size overhead. Typical preview images are <500KB. For high-frequency
polling, consider implementing error backoff and limiting concurrent requests.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getliveimage).

## Example

```typescript
import { getLiveImage } from 'een-api-toolkit'

const { data, error } = await getLiveImage({ deviceId: 'camera-123' })

if (data) {
  // Display in an img element
  document.getElementById('cameraImage').src = data.imageData
  console.log('Image timestamp:', data.timestamp)
}

// Continuously update the image with proper error handling
let isRunning = true
async function refreshLoop() {
  const imgElement = document.getElementById('cameraImage') as HTMLImageElement
  while (isRunning) {
    const { data, error } = await getLiveImage({ deviceId: 'camera-123' })
    if (error) {
      console.error('Refresh failed:', error.message)
      break // Stop on error
    }
    if (data) {
      imgElement.src = data.imageData
    }
    await new Promise(r => setTimeout(r, 1000))
  }
}
// Call refreshLoop() to start, set isRunning = false to stop
```
