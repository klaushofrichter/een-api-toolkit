[**EEN API Toolkit v0.3.6**](../README.md)

***

[EEN API Toolkit](../README.md) / GetRecordedImageParams

# Interface: GetRecordedImageParams

Defined in: [src/types/media.ts:181](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L181)

Parameters for getting a recorded image.

## Remarks

Used to fetch a recorded image from a camera at a specific timestamp.
Either deviceId with a timestamp parameter, or pageToken is required.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getrecordedimage).

## Example

```typescript
import { getRecordedImage } from 'een-api-toolkit'

// Get image at or after a specific time
const { data } = await getRecordedImage({
  deviceId: 'camera-123',
  type: 'preview',
  timestamp__gte: '2024-01-15T10:00:00.000Z'
})
```

## Properties

### deviceId?

> `optional` **deviceId**: `string`

Defined in: [src/types/media.ts:183](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L183)

The ID of the device (camera) - required unless using pageToken

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/media.ts:185](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L185)

Token from previous request to fetch next/previous image

***

### type?

> `optional` **type**: [`MediaStreamType`](../type-aliases/MediaStreamType.md)

Defined in: [src/types/media.ts:187](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L187)

Stream type (preview or main)

***

### timestamp\_\_lt?

> `optional` **timestamp\_\_lt**: `string`

Defined in: [src/types/media.ts:189](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L189)

Return first image with timestamp less than this value

***

### timestamp\_\_lte?

> `optional` **timestamp\_\_lte**: `string`

Defined in: [src/types/media.ts:191](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L191)

Return first image with timestamp less than or equal to this value

***

### timestamp?

> `optional` **timestamp**: `string`

Defined in: [src/types/media.ts:193](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L193)

Return image at this exact timestamp

***

### timestamp\_\_gte?

> `optional` **timestamp\_\_gte**: `string`

Defined in: [src/types/media.ts:195](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L195)

Return first image with timestamp greater than or equal to this value

***

### timestamp\_\_gt?

> `optional` **timestamp\_\_gt**: `string`

Defined in: [src/types/media.ts:197](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L197)

Return first image with timestamp greater than this value

***

### overlayId\_\_in?

> `optional` **overlayId\_\_in**: `string`[]

Defined in: [src/types/media.ts:199](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L199)

List of overlay IDs to include

***

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/media.ts:204](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L204)

Include options for overlays.
Valid values: overlayEmbedded, overlaySvgHeader

***

### targetWidth?

> `optional` **targetWidth**: `number`

Defined in: [src/types/media.ts:206](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L206)

Target width for the returned image (32-7680)

***

### targetHeight?

> `optional` **targetHeight**: `number`

Defined in: [src/types/media.ts:208](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L208)

Target height for the returned image (32-4320)
