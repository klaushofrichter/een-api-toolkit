[**EEN API Toolkit v0.3.32**](../README.md)

***

[EEN API Toolkit](../README.md) / Layout

# Interface: Layout

Defined in: [src/types/layout.ts:133](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L133)

Layout entity from EEN API v3.0.

## Remarks

Represents a layout (grouping of cameras) in the Eagle Eye Networks platform.
Layouts organize multiple camera views into a grid for monitoring.

For more details on layout management, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listlayouts).

## Example

```typescript
import { getLayouts, type Layout } from 'een-api-toolkit'

const { data, error } = await getLayouts()
if (data) {
  data.results.forEach((layout: Layout) => {
    console.log(`${layout.name}: ${layout.panes.length} cameras`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [src/types/layout.ts:135](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L135)

Unique identifier for the layout

***

### name

> **name**: `string`

Defined in: [src/types/layout.ts:137](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L137)

Display name of the layout

***

### accountId

> **accountId**: `string`

Defined in: [src/types/layout.ts:139](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L139)

ID of the account this layout belongs to

***

### panes

> **panes**: [`LayoutPane`](LayoutPane.md)[]

Defined in: [src/types/layout.ts:141](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L141)

Array of panes (camera positions) in the layout

***

### settings

> **settings**: [`LayoutSettings`](LayoutSettings.md)

Defined in: [src/types/layout.ts:143](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L143)

Display settings for the layout

***

### effectivePermissions?

> `optional` **effectivePermissions**: [`LayoutPermissions`](LayoutPermissions.md)

Defined in: [src/types/layout.ts:145](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L145)

Permissions the current user has on this layout (optional, via include)

***

### resourceCounts?

> `optional` **resourceCounts**: `object`

Defined in: [src/types/layout.ts:147](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L147)

Count of resources in the layout (optional, via include)

#### cameras?

> `optional` **cameras**: `number`

***

### resourceStatusCounts?

> `optional` **resourceStatusCounts**: `object`

Defined in: [src/types/layout.ts:151](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L151)

Status counts of cameras in the layout (optional, via include)

#### cameras?

> `optional` **cameras**: [`CameraStatusCounts`](CameraStatusCounts.md)

***

### qRelevance?

> `optional` **qRelevance**: `number`

Defined in: [src/types/layout.ts:155](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/layout.ts#L155)

Search relevance score when using q parameter
