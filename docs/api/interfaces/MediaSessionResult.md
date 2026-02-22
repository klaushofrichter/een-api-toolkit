[**EEN API Toolkit v0.3.93**](../README.md)

***

[EEN API Toolkit](../README.md) / MediaSessionResult

# Interface: MediaSessionResult

Defined in: [types/media.ts:260](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L260)

Result of initializing a media session.

## Remarks

Indicates whether the media session was successfully initialized.
When successful, the browser will have a session cookie set that
allows media playback without explicit authorization headers.

## Properties

### success

> **success**: `boolean`

Defined in: [types/media.ts:262](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L262)

Whether the session was successfully initialized

***

### sessionUrl

> **sessionUrl**: `string`

Defined in: [types/media.ts:264](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/media.ts#L264)

The session URL that was called (for debugging)
