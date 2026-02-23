[**EEN API Toolkit v0.3.99**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettingsRetention

# Interface: CameraSettingsRetention

Defined in: [types/camera.ts:453](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L453)

Camera retention settings.

## Remarks

Controls how long video data is retained in cloud and on-premise storage.

## Properties

### cloudDays?

> `optional` **cloudDays**: `number`

Defined in: [types/camera.ts:455](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L455)

Number of days to retain recordings in cloud

***

### cloudPreviewOnly?

> `optional` **cloudPreviewOnly**: `boolean`

Defined in: [types/camera.ts:457](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L457)

Whether cloud stores only preview (lower resolution) video

***

### minimumOnPremiseDays?

> `optional` **minimumOnPremiseDays**: `number`

Defined in: [types/camera.ts:459](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L459)

Minimum days to retain on the bridge

***

### maximumOnPremiseDays?

> `optional` **maximumOnPremiseDays**: `number`

Defined in: [types/camera.ts:461](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L461)

Maximum days to retain on the bridge

***

### alwaysRecordingDays?

> `optional` **alwaysRecordingDays**: `number`

Defined in: [types/camera.ts:463](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L463)

Number of days to always record (regardless of motion)
