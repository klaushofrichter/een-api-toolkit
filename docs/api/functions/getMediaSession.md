[**EEN API Toolkit v0.3.96**](../README.md)

***

[EEN API Toolkit](../README.md) / getMediaSession

# Function: getMediaSession()

> **getMediaSession**(): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`MediaSessionResponse`](../interfaces/MediaSessionResponse.md)\>\>

Defined in: [media/service.ts:535](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/media/service.ts#L535)

Get the media session URL for setting cookies.

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`MediaSessionResponse`](../interfaces/MediaSessionResponse.md)\>\>

A Result containing the media session URL or an error

## Remarks

Fetches the URL needed to set the media session cookie. The returned URL
must be called separately (with credentials included) to actually set the
cookie. This is the first step in the two-step media session initialization
process.

For most use cases, prefer using [initMediaSession](initMediaSession.md) which handles
both steps automatically.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/docs/watch-live-video).

## Example

```typescript
import { getMediaSession } from 'een-api-toolkit'

// Get the session URL (step 1)
const { data, error } = await getMediaSession()

if (data) {
  console.log('Session URL:', data.url)
  // Now call data.url with credentials: 'include' to set the cookie
}
```
