[**EEN API Toolkit v0.3.47**](../README.md)

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

Defined in: [src/types/layout.ts:85](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L85)

Unique identifier for the pane within the layout.

#### Remarks

- Must be unique within the same layout (no duplicate IDs)
- IDs are client-managed; you assign them when creating/updating panes
- Can be reused after a pane is deleted from the layout
- Typically assigned sequentially (0, 1, 2, ...) but any unique number works

***

### name

> **name**: `string`

Defined in: [src/types/layout.ts:87](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L87)

Display name for the pane

***

### type

> **type**: [`LayoutPaneType`](../type-aliases/LayoutPaneType.md)

Defined in: [src/types/layout.ts:89](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L89)

Type of preview to display

***

### size

> **size**: [`LayoutPaneSize`](../type-aliases/LayoutPaneSize.md)

Defined in: [src/types/layout.ts:91](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L91)

Size of the pane in the grid (1-3)

***

### cameraId

> **cameraId**: `string`

Defined in: [src/types/layout.ts:93](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L93)

ID of the camera to display in this pane

***

### compositeId?

> `optional` **compositeId**: `string` \| `null`

Defined in: [src/types/layout.ts:95](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L95)

ID of composite preview if using compositePreview type
