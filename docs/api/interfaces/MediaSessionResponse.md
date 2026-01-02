[**EEN API Toolkit v0.1.14**](../README.md)

***

[EEN API Toolkit](../README.md) / MediaSessionResponse

# Interface: MediaSessionResponse

Defined in: [src/types/media.ts:245](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L245)

Response from the media session endpoint.

## Remarks

Contains the URL to call to set the media session cookie.
The session cookie enables media playback in browsers without
passing the Bearer token in every request.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/docs/watch-live-video).

## Properties

### url

> **url**: `string`

Defined in: [src/types/media.ts:247](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L247)

URL to call to set the media session cookie
