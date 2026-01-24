[**EEN API Toolkit v0.3.32**](../README.md)

***

[EEN API Toolkit](../README.md) / LayoutPane

# Interface: LayoutPane

Defined in: [src/types/layout.ts:75](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L75)

A single pane within a layout.

## Remarks

Represents one camera view position in the layout grid.

## Properties

### id

> **id**: `number`

Defined in: [src/types/layout.ts:77](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L77)

Unique identifier for the pane within the layout

***

### name

> **name**: `string`

Defined in: [src/types/layout.ts:79](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L79)

Display name for the pane

***

### type

> **type**: [`LayoutPaneType`](../type-aliases/LayoutPaneType.md)

Defined in: [src/types/layout.ts:81](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L81)

Type of preview to display

***

### size

> **size**: [`LayoutPaneSize`](../type-aliases/LayoutPaneSize.md)

Defined in: [src/types/layout.ts:83](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L83)

Size of the pane in the grid (1-3)

***

### cameraId

> **cameraId**: `string`

Defined in: [src/types/layout.ts:85](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L85)

ID of the camera to display in this pane

***

### compositeId?

> `optional` **compositeId**: `string` \| `null`

Defined in: [src/types/layout.ts:87](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L87)

ID of composite preview if using compositePreview type
