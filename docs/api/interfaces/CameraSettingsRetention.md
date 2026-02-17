[**EEN API Toolkit v0.3.85**](../README.md)

***

[EEN API Toolkit](../README.md) / CameraSettingsRetention

# Interface: CameraSettingsRetention

Defined in: [types/camera.ts:434](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L434)

Camera retention settings.

## Remarks

Controls how long video data is retained in cloud and on-premise storage.

## Properties

### cloudDays?

> `optional` **cloudDays**: `number`

Defined in: [types/camera.ts:436](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L436)

Number of days to retain recordings in cloud

***

### cloudPreviewOnly?

> `optional` **cloudPreviewOnly**: `boolean`

Defined in: [types/camera.ts:438](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L438)

Whether cloud stores only preview (lower resolution) video

***

### minimumOnPremiseDays?

> `optional` **minimumOnPremiseDays**: `number`

Defined in: [types/camera.ts:440](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L440)

Minimum days to retain on the bridge

***

### maximumOnPremiseDays?

> `optional` **maximumOnPremiseDays**: `number`

Defined in: [types/camera.ts:442](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L442)

Maximum days to retain on the bridge

***

### alwaysRecordingDays?

> `optional` **alwaysRecordingDays**: `number`

Defined in: [types/camera.ts:444](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L444)

Number of days to always record (regardless of motion)
