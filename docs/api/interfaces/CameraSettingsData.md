[**EEN API Toolkit v0.3.59**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettingsData

# Interface: CameraSettingsData

Defined in: [src/types/camera.ts:605](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L605)

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

> `optional` **timeZone**: `string`

Defined in: [src/types/camera.ts:607](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L607)

Camera timezone (IANA timezone name)

***

### rtsp?

> `optional` **rtsp**: [`CameraRtspConnectionSettings`](CameraRtspConnectionSettings.md)

Defined in: [src/types/camera.ts:609](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L609)

RTSP connection settings

***

### credentials?

> `optional` **credentials**: [`CameraSettingsCredentials`](CameraSettingsCredentials.md)

Defined in: [src/types/camera.ts:611](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L611)

Camera device credentials

***

### retention?

> `optional` **retention**: [`CameraSettingsRetention`](CameraSettingsRetention.md)

Defined in: [src/types/camera.ts:613](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L613)

Retention settings

***

### audio?

> `optional` **audio**: [`CameraSettingsAudio`](CameraSettingsAudio.md)

Defined in: [src/types/camera.ts:615](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L615)

Audio settings

***

### previewVideo?

> `optional` **previewVideo**: [`CameraSettingsPreviewVideo`](CameraSettingsPreviewVideo.md)

Defined in: [src/types/camera.ts:617](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L617)

Preview video stream settings

***

### mainVideo?

> `optional` **mainVideo**: [`CameraSettingsMainVideo`](CameraSettingsMainVideo.md)

Defined in: [src/types/camera.ts:619](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L619)

Main video stream settings

***

### analog?

> `optional` **analog**: [`CameraSettingsAnalog`](CameraSettingsAnalog.md)

Defined in: [src/types/camera.ts:621](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L621)

Analog video settings

***

### operatingSettings?

> `optional` **operatingSettings**: [`CameraSettingsOperating`](CameraSettingsOperating.md)

Defined in: [src/types/camera.ts:623](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L623)

Operating on/off settings

***

### talkdown?

> `optional` **talkdown**: [`CameraSettingsTalkdown`](CameraSettingsTalkdown.md)

Defined in: [src/types/camera.ts:625](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L625)

Talkdown (two-way audio) settings
