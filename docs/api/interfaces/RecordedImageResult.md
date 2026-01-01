[**EEN API Toolkit v0.1.10**](../README.md)

***

[EEN API Toolkit](../README.md) / RecordedImageResult

# Interface: RecordedImageResult

Defined in: [src/types/media.ts:219](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L219)

Result of getting a recorded image.

## Remarks

Contains the image data as a base64 data URL and metadata from response headers.

## Properties

### imageData

> **imageData**: `string`

Defined in: [src/types/media.ts:221](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L221)

Base64 encoded image data URL (data:image/jpeg;base64,...)

***

### timestamp

> **timestamp**: `string` \| `null`

Defined in: [src/types/media.ts:223](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L223)

Timestamp of the image (from X-Een-Timestamp header)

***

### nextToken

> **nextToken**: `string` \| `null`

Defined in: [src/types/media.ts:225](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L225)

Token to fetch the next image (from X-Een-NextToken header)

***

### prevToken

> **prevToken**: `string` \| `null`

Defined in: [src/types/media.ts:227](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L227)

Token to fetch the previous image (from X-Een-PrevToken header)

***

### overlaySvg

> **overlaySvg**: `string` \| `null`

Defined in: [src/types/media.ts:229](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L229)

SVG overlay data (from X-Een-OverlaySvg header, if requested)
