[**EEN API Toolkit v0.3.25**](../README.md)

***

[EEN API Toolkit](../README.md) / Feed

# Interface: Feed

Defined in: [src/types/feeds.ts:104](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L104)

A feed representing a stream from a device.

## Remarks

Feeds are associated with devices (cameras, speakers) and provide
streaming URLs in various formats. A single device can have multiple
feeds (main, preview, talkdown).

URL fields are only populated if requested via the `include` parameter.

## Example

```typescript
const feed: Feed = {
  id: '10058b7a-main',
  type: 'main',
  deviceId: '10058b7a',
  mediaType: 'video',
  hlsUrl: 'https://...',
  flvUrl: 'https://...'
}
```

## Properties

### id

> **id**: `string`

Defined in: [src/types/feeds.ts:106](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L106)

Unique feed identifier (typically deviceId-type format)

***

### type

> **type**: [`FeedStreamType`](../type-aliases/FeedStreamType.md)

Defined in: [src/types/feeds.ts:109](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L109)

Stream type of the feed

***

### deviceId

> **deviceId**: `string`

Defined in: [src/types/feeds.ts:112](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L112)

ID of the device generating this feed

***

### mediaType

> **mediaType**: [`FeedMediaType`](../type-aliases/FeedMediaType.md)

Defined in: [src/types/feeds.ts:115](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L115)

Media type of the feed content

***

### flvUrl?

> `optional` **flvUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:118](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L118)

Flash Video URL (if requested via include)

***

### rtspUrl?

> `optional` **rtspUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:121](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L121)

RTSP URL (if requested via include)

***

### rtspsUrl?

> `optional` **rtspsUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:124](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L124)

RTSP over TLS URL (if requested via include)

***

### localRtspUrl?

> `optional` **localRtspUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:127](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L127)

Local RTSP URL to bridge (if requested via include)

***

### hlsUrl?

> `optional` **hlsUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:130](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L130)

HLS URL (if requested via include)

***

### multipartUrl?

> `optional` **multipartUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:133](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L133)

Multipart URL for raw frames (if requested via include)

***

### webRtcUrl?

> `optional` **webRtcUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:136](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L136)

WebRTC URL (if requested via include)

***

### audioPushHttpsUrl?

> `optional` **audioPushHttpsUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:139](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L139)

Audio push URL for speakers (if requested via include)
