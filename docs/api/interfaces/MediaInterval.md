[**EEN API Toolkit v0.3.87**](../README.md)

***

[EEN API Toolkit](../README.md) / MediaInterval

# Interface: MediaInterval

Defined in: [types/media.ts:31](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L31)

Media interval from EEN API v3.0.

## Remarks

Represents a time interval for which recordings exist.

## Properties

### type

> **type**: [`MediaStreamType`](../type-aliases/MediaStreamType.md)

Defined in: [types/media.ts:33](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L33)

Stream type (preview or main)

***

### deviceId

> **deviceId**: `string`

Defined in: [types/media.ts:35](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L35)

The device ID that generated the media

***

### mediaType

> **mediaType**: [`MediaType`](../type-aliases/MediaType.md)

Defined in: [types/media.ts:37](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L37)

Type of media contained (video or image)

***

### startTimestamp

> **startTimestamp**: `string`

Defined in: [types/media.ts:39](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L39)

Start time of the media interval (ISO 8601)

***

### endTimestamp

> **endTimestamp**: `string`

Defined in: [types/media.ts:41](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L41)

End time of the media interval (ISO 8601)

***

### flvUrl?

> `optional` **flvUrl**: `string` \| `null`

Defined in: [types/media.ts:43](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L43)

Flash video URL (if requested via include)

***

### rtspUrl?

> `optional` **rtspUrl**: `string`

Defined in: [types/media.ts:45](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L45)

RTSP URL (if requested via include)

***

### rtspsUrl?

> `optional` **rtspsUrl**: `string`

Defined in: [types/media.ts:47](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L47)

RTSPS URL (if requested via include)

***

### hlsUrl?

> `optional` **hlsUrl**: `string` \| `null`

Defined in: [types/media.ts:49](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L49)

HLS URL (if requested via include)

***

### multipartUrl?

> `optional` **multipartUrl**: `string`

Defined in: [types/media.ts:51](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L51)

Multipart URL (if requested via include)

***

### mp4Url?

> `optional` **mp4Url**: `string` \| `null`

Defined in: [types/media.ts:53](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L53)

MP4 URL (if requested via include)

***

### wsLiveUrl?

> `optional` **wsLiveUrl**: `string`

Defined in: [types/media.ts:55](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L55)

WebSocket live URL (if requested via include)
