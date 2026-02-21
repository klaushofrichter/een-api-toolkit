[**EEN API Toolkit v0.3.89**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettingsRetention

# Interface: CameraSettingsRetention

Defined in: [types/camera.ts:441](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L441)

Camera retention settings.

## Remarks

Controls how long video data is retained in cloud and on-premise storage.

## Properties

### cloudDays?

> `optional` **cloudDays**: `number`

Defined in: [types/camera.ts:443](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L443)

Number of days to retain recordings in cloud

***

### cloudPreviewOnly?

> `optional` **cloudPreviewOnly**: `boolean`

Defined in: [types/camera.ts:445](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L445)

Whether cloud stores only preview (lower resolution) video

***

### minimumOnPremiseDays?

> `optional` **minimumOnPremiseDays**: `number`

Defined in: [types/camera.ts:447](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L447)

Minimum days to retain on the bridge

***

### maximumOnPremiseDays?

> `optional` **maximumOnPremiseDays**: `number`

Defined in: [types/camera.ts:449](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L449)

Maximum days to retain on the bridge

***

### alwaysRecordingDays?

> `optional` **alwaysRecordingDays**: `number`

Defined in: [types/camera.ts:451](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L451)

Number of days to always record (regardless of motion)
