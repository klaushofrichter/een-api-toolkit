[**EEN API Toolkit v0.3.105**](../README.md)

***

[EEN API Toolkit](../README.md) / ListCamerasParams

# Interface: ListCamerasParams

Defined in: [types/camera.ts:292](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L292)

Parameters for listing cameras.

## Remarks

Supports extensive filtering options matching the EEN API v3.0.
All array parameters are sent as comma-separated values.

For more details, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/listcameras).

## Example

```typescript
import { getCameras } from 'een-api-toolkit'

// Get online cameras with pagination
const { data } = await getCameras({
  pageSize: 50,
  status__in: ['online', 'streaming'],
  include: ['deviceInfo', 'streamUrls']
})

// Search cameras by name
const { data: searchResults } = await getCameras({
  q: 'front door',
  qRelevance__gte: 0.5
})

// Filter by location and tags
const { data: filtered } = await getCameras({
  locationId__in: ['loc-123'],
  tags__contains: ['security', 'entrance']
})
```

## Properties

### pageSize?

> `optional` **pageSize?**: `number`

Defined in: [types/camera.ts:295](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L295)

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken?**: `string`

Defined in: [types/camera.ts:297](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L297)

Token for fetching a specific page

***

### include?

> `optional` **include?**: `string`[]

Defined in: [types/camera.ts:301](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L301)

Additional fields to include in the response

***

### sort?

> `optional` **sort?**: `string`[]

Defined in: [types/camera.ts:303](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L303)

Fields to sort by (prefix with - for descending)

***

### locationId\_\_in?

> `optional` **locationId\_\_in?**: `string`[]

Defined in: [types/camera.ts:307](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L307)

Filter by location IDs

***

### bridgeId\_\_in?

> `optional` **bridgeId\_\_in?**: `string`[]

Defined in: [types/camera.ts:309](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L309)

Filter by bridge IDs

***

### multiCameraId?

> `optional` **multiCameraId?**: `string`

Defined in: [types/camera.ts:313](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L313)

Filter by exact multi-camera ID

***

### multiCameraId\_\_ne?

> `optional` **multiCameraId\_\_ne?**: `string`

Defined in: [types/camera.ts:315](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L315)

Filter by multi-camera ID not equal to

***

### multiCameraId\_\_in?

> `optional` **multiCameraId\_\_in?**: `string`[]

Defined in: [types/camera.ts:317](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L317)

Filter by multi-camera IDs (any match)

***

### tags\_\_contains?

> `optional` **tags\_\_contains?**: `string`[]

Defined in: [types/camera.ts:321](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L321)

Filter by tags (all tags must be present)

***

### tags\_\_any?

> `optional` **tags\_\_any?**: `string`[]

Defined in: [types/camera.ts:323](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L323)

Filter by tags (any tag must be present)

***

### packages\_\_contains?

> `optional` **packages\_\_contains?**: `string`[]

Defined in: [types/camera.ts:325](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L325)

Filter by packages (all must be present)

***

### name?

> `optional` **name?**: `string`

Defined in: [types/camera.ts:329](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L329)

Filter by exact name

***

### name\_\_contains?

> `optional` **name\_\_contains?**: `string`

Defined in: [types/camera.ts:331](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L331)

Filter by name containing substring (case-insensitive)

***

### name\_\_in?

> `optional` **name\_\_in?**: `string`[]

Defined in: [types/camera.ts:333](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L333)

Filter by exact names (any match)

***

### id\_\_in?

> `optional` **id\_\_in?**: `string`[]

Defined in: [types/camera.ts:337](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L337)

Filter by camera IDs

***

### id\_\_notIn?

> `optional` **id\_\_notIn?**: `string`[]

Defined in: [types/camera.ts:339](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L339)

Exclude camera IDs

***

### id\_\_contains?

> `optional` **id\_\_contains?**: `string`

Defined in: [types/camera.ts:341](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L341)

Filter by ID containing substring

***

### layoutId?

> `optional` **layoutId?**: `string`

Defined in: [types/camera.ts:345](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L345)

Filter by layout ID

***

### shared?

> `optional` **shared?**: `boolean`

Defined in: [types/camera.ts:349](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L349)

Filter by shared status. Maps to `shareDetails.shared` in the API query.

***

### sharedCameraAccount?

> `optional` **sharedCameraAccount?**: `string`

Defined in: [types/camera.ts:351](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L351)

Filter by sharing account ID. Maps to `shareDetails.accountId` in the API query.

***

### firstResponder?

> `optional` **firstResponder?**: `boolean`

Defined in: [types/camera.ts:353](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L353)

Filter by first responder sharing. Maps to `shareDetails.firstResponder` in the API query.

***

### directToCloud?

> `optional` **directToCloud?**: `boolean`

Defined in: [types/camera.ts:357](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L357)

Filter by direct-to-cloud connection. Maps to `deviceInfo.directToCloud` in the API query.

***

### speakerId\_\_in?

> `optional` **speakerId\_\_in?**: `string`[]

Defined in: [types/camera.ts:361](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L361)

Filter by speaker IDs

***

### q?

> `optional` **q?**: `string`

Defined in: [types/camera.ts:365](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L365)

Full-text search query

***

### qRelevance\_\_gte?

> `optional` **qRelevance\_\_gte?**: `number`

Defined in: [types/camera.ts:367](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L367)

Minimum search relevance score

***

### enabledAnalytics\_\_contains?

> `optional` **enabledAnalytics\_\_contains?**: `string`[]

Defined in: [types/camera.ts:371](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L371)

Filter by enabled analytics (all must be present)

***

### status\_\_in?

> `optional` **status\_\_in?**: [`CameraStatus`](../type-aliases/CameraStatus.md)[]

Defined in: [types/camera.ts:375](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L375)

Filter by status values (any match)

***

### status\_\_ne?

> `optional` **status\_\_ne?**: [`CameraStatus`](../type-aliases/CameraStatus.md)

Defined in: [types/camera.ts:377](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L377)

Filter by status not equal to
