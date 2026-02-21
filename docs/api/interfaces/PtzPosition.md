[**EEN API Toolkit v0.3.89**](../README.md)

***

[EEN API Toolkit](../README.md) / PtzPosition

# Interface: PtzPosition

Defined in: [types/ptz.ts:10](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L10)

Pan/Tilt/Zoom position coordinates.

## Remarks

Represents the current or target position of a PTZ camera.
Values are optional since you may want to move only one axis at a time.

## Properties

### x?

> `optional` **x**: `number`

Defined in: [types/ptz.ts:12](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L12)

Pan position (horizontal rotation)

***

### y?

> `optional` **y**: `number`

Defined in: [types/ptz.ts:14](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L14)

Tilt position (vertical rotation)

***

### z?

> `optional` **z**: `number`

Defined in: [types/ptz.ts:16](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/ptz.ts#L16)

Zoom level
