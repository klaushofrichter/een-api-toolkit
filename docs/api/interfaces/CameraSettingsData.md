[**EEN API Toolkit v0.3.109**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettingsData

# Interface: CameraSettingsData

Defined in: [types/camera.ts:624](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L624)

Aggregated camera settings data.

## Remarks

Contains all operational settings for a camera, including retention,
audio, video, analog, operating, and talkdown settings.

## Example

```typescript
import { getCameraSettings, type CameraSettingsData } from 'een-api-toolkit'

const { data } = await getCameraSettings('camera-123')
if (data) {
  console.log('Timezone:', data.data.timeZone)
  console.log('Retention cloud days:', data.data.retention?.cloudDays)
}
```

## Properties

### timeZone?

> `optional` **timeZone?**: `string`

Defined in: [types/camera.ts:626](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L626)

Camera timezone (IANA timezone name)

***

### rtsp?

> `optional` **rtsp?**: [`CameraRtspConnectionSettings`](CameraRtspConnectionSettings.md)

Defined in: [types/camera.ts:628](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L628)

RTSP connection settings

***

### credentials?

> `optional` **credentials?**: [`CameraSettingsCredentials`](CameraSettingsCredentials.md)

Defined in: [types/camera.ts:630](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L630)

Camera device credentials

***

### retention?

> `optional` **retention?**: [`CameraSettingsRetention`](CameraSettingsRetention.md)

Defined in: [types/camera.ts:632](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L632)

Retention settings

***

### audio?

> `optional` **audio?**: [`CameraSettingsAudio`](CameraSettingsAudio.md)

Defined in: [types/camera.ts:634](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L634)

Audio settings

***

### previewVideo?

> `optional` **previewVideo?**: [`CameraSettingsPreviewVideo`](CameraSettingsPreviewVideo.md)

Defined in: [types/camera.ts:636](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L636)

Preview video stream settings

***

### mainVideo?

> `optional` **mainVideo?**: [`CameraSettingsMainVideo`](CameraSettingsMainVideo.md)

Defined in: [types/camera.ts:638](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L638)

Main video stream settings

***

### analog?

> `optional` **analog?**: [`CameraSettingsAnalog`](CameraSettingsAnalog.md)

Defined in: [types/camera.ts:640](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L640)

Analog video settings

***

### operatingSettings?

> `optional` **operatingSettings?**: [`CameraSettingsOperating`](CameraSettingsOperating.md)

Defined in: [types/camera.ts:642](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L642)

Operating on/off settings

***

### talkdown?

> `optional` **talkdown?**: [`CameraSettingsTalkdown`](CameraSettingsTalkdown.md)

Defined in: [types/camera.ts:644](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L644)

Talkdown (two-way audio) settings
