[**EEN API Toolkit v0.3.65**](../README.md)

***

[EEN API Toolkit](../README.md) / LiveImageResult

# Interface: LiveImageResult

Defined in: [src/types/media.ts:148](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L148)

Result of getting a live image.

## Remarks

Contains the image data as a base64 data URL and metadata from response headers.

## Properties

### imageData

> **imageData**: `string`

Defined in: [src/types/media.ts:150](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L150)

Base64 encoded image data URL (data:image/jpeg;base64,...)

***

### timestamp

> **timestamp**: `string` \| `null`

Defined in: [src/types/media.ts:152](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L152)

Timestamp of the image (from X-Een-Timestamp header)

***

### prevToken

> **prevToken**: `string` \| `null`

Defined in: [src/types/media.ts:154](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L154)

Token to fetch the previous image (from X-Een-PrevToken header)
