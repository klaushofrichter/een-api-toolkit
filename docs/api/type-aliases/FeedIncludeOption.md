[**EEN API Toolkit v0.3.34**](../README.md)

***

[EEN API Toolkit](../README.md) / FeedIncludeOption

# Type Alias: FeedIncludeOption

> **FeedIncludeOption** = `"flvUrl"` \| `"rtspUrl"` \| `"rtspsUrl"` \| `"localRtspUrl"` \| `"hlsUrl"` \| `"multipartUrl"` \| `"webRtcUrl"` \| `"audioPushHttpsUrl"`

Defined in: [src/types/feeds.ts:59](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/feeds.ts#L59)

URL fields that can be included in feed responses.

## Remarks

By default, URL fields are not included in responses. Use the `include`
parameter in [ListFeedsParams](../interfaces/ListFeedsParams.md) to request specific URL fields.

- `flvUrl`: Flash Video over HTTPS (supports live and playback)
- `rtspUrl`: RTSP protocol stream
- `rtspsUrl`: RTSP over TLS (encrypted)
- `localRtspUrl`: RTSP directly to bridge (not cloud)
- `hlsUrl`: HTTP Live Streaming over HTTPS
- `multipartUrl`: Proprietary protocol for raw frames
- `webRtcUrl`: WebRTC for push-to-talk connections
- `audioPushHttpsUrl`: Audio push URL for speakers
