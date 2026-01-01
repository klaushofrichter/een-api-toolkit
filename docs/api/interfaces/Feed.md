[**EEN API Toolkit v0.1.8**](../README.md)

***

[EEN API Toolkit](../README.md) / Feed

# Interface: Feed

Defined in: [src/types/feeds.ts:93](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L93)

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

Defined in: [src/types/feeds.ts:95](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L95)

Unique feed identifier (typically deviceId-type format)

***

### type

> **type**: [`FeedStreamType`](../type-aliases/FeedStreamType.md)

Defined in: [src/types/feeds.ts:98](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L98)

Stream type of the feed

***

### deviceId

> **deviceId**: `string`

Defined in: [src/types/feeds.ts:101](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L101)

ID of the device generating this feed

***

### mediaType

> **mediaType**: [`FeedMediaType`](../type-aliases/FeedMediaType.md)

Defined in: [src/types/feeds.ts:104](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L104)

Media type of the feed content

***

### flvUrl?

> `optional` **flvUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:107](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L107)

Flash Video URL (if requested via include)

***

### rtspUrl?

> `optional` **rtspUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:110](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L110)

RTSP URL (if requested via include)

***

### rtspsUrl?

> `optional` **rtspsUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:113](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L113)

RTSP over TLS URL (if requested via include)

***

### localRtspUrl?

> `optional` **localRtspUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:116](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L116)

Local RTSP URL to bridge (if requested via include)

***

### hlsUrl?

> `optional` **hlsUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:119](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L119)

HLS URL (if requested via include)

***

### multipartUrl?

> `optional` **multipartUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:122](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L122)

Multipart URL for raw frames (if requested via include)

***

### webRtcUrl?

> `optional` **webRtcUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:125](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L125)

WebRTC URL (if requested via include)

***

### audioPushHttpsUrl?

> `optional` **audioPushHttpsUrl**: `string` \| `null`

Defined in: [src/types/feeds.ts:128](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L128)

Audio push URL for speakers (if requested via include)
