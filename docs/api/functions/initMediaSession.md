[**EEN API Toolkit v0.3.76**](../README.md)

***

[EEN API Toolkit](../README.md) / initMediaSession

# Function: initMediaSession()

> **initMediaSession**(): `Promise`\<[`Result`](../type-aliases/Result.md)\<[`MediaSessionResult`](../interfaces/MediaSessionResult.md)\>\>

Defined in: [media/service.ts:627](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/media/service.ts#L627)

Initialize the media session by setting the session cookie.

## Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`MediaSessionResult`](../interfaces/MediaSessionResult.md)\>\>

A Result containing the session result or an error

## Remarks

This function handles the two-step process of setting up a media session:
1. Fetches the session URL from `/api/v3.0/media/session`
2. Calls that URL with credentials to set the session cookie

Once the session cookie is set, the browser can access media streams
(like multipart preview URLs) without explicit Authorization headers.
This is required for using media URLs directly in HTML elements like
`<img>` or `<video>`.

**Important**: This function must be called in a browser environment
where cookies can be set. It uses `credentials: 'include'` to ensure
the cookie is stored.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/docs/watch-live-video).

## Example

```typescript
import { initMediaSession, listFeeds } from 'een-api-toolkit'

// Initialize the media session (do this once after login)
const { data, error } = await initMediaSession()

if (error) {
  console.error('Failed to init media session:', error.message)
  return
}

// Now you can use multipart URLs directly in <img> elements
const { data: feeds } = await listFeeds({
  deviceId: 'camera-123',
  include: ['multipartUrl']
})

if (feeds?.results[0]?.multipartUrl) {
  // This works because the session cookie is set
  imgElement.src = feeds.results[0].multipartUrl
}
```
