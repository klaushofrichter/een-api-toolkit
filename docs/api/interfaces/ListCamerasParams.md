[**EEN API Toolkit v0.0.14**](../README.md)

***

[EEN API Toolkit](../README.md) / ListCamerasParams

# Interface: ListCamerasParams

Defined in: [src/types/camera.ts:251](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L251)

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

> `optional` **pageSize**: `number`

Defined in: [src/types/camera.ts:254](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L254)

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/camera.ts:256](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L256)

Token for fetching a specific page

***

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/camera.ts:260](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L260)

Additional fields to include in the response

***

### sort?

> `optional` **sort**: `string`[]

Defined in: [src/types/camera.ts:262](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L262)

Fields to sort by (prefix with - for descending)

***

### locationId\_\_in?

> `optional` **locationId\_\_in**: `string`[]

Defined in: [src/types/camera.ts:266](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L266)

Filter by location IDs

***

### bridgeId\_\_in?

> `optional` **bridgeId\_\_in**: `string`[]

Defined in: [src/types/camera.ts:268](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L268)

Filter by bridge IDs

***

### multiCameraId?

> `optional` **multiCameraId**: `string`

Defined in: [src/types/camera.ts:272](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L272)

Filter by exact multi-camera ID

***

### multiCameraId\_\_ne?

> `optional` **multiCameraId\_\_ne**: `string`

Defined in: [src/types/camera.ts:274](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L274)

Filter by multi-camera ID not equal to

***

### multiCameraId\_\_in?

> `optional` **multiCameraId\_\_in**: `string`[]

Defined in: [src/types/camera.ts:276](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L276)

Filter by multi-camera IDs (any match)

***

### tags\_\_contains?

> `optional` **tags\_\_contains**: `string`[]

Defined in: [src/types/camera.ts:280](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L280)

Filter by tags (all tags must be present)

***

### tags\_\_any?

> `optional` **tags\_\_any**: `string`[]

Defined in: [src/types/camera.ts:282](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L282)

Filter by tags (any tag must be present)

***

### packages\_\_contains?

> `optional` **packages\_\_contains**: `string`[]

Defined in: [src/types/camera.ts:284](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L284)

Filter by packages (all must be present)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/camera.ts:288](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L288)

Filter by exact name

***

### name\_\_contains?

> `optional` **name\_\_contains**: `string`

Defined in: [src/types/camera.ts:290](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L290)

Filter by name containing substring (case-insensitive)

***

### name\_\_in?

> `optional` **name\_\_in**: `string`[]

Defined in: [src/types/camera.ts:292](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L292)

Filter by exact names (any match)

***

### id\_\_in?

> `optional` **id\_\_in**: `string`[]

Defined in: [src/types/camera.ts:296](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L296)

Filter by camera IDs

***

### id\_\_notIn?

> `optional` **id\_\_notIn**: `string`[]

Defined in: [src/types/camera.ts:298](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L298)

Exclude camera IDs

***

### id\_\_contains?

> `optional` **id\_\_contains**: `string`

Defined in: [src/types/camera.ts:300](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L300)

Filter by ID containing substring

***

### layoutId?

> `optional` **layoutId**: `string`

Defined in: [src/types/camera.ts:304](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L304)

Filter by layout ID

***

### shared?

> `optional` **shared**: `boolean`

Defined in: [src/types/camera.ts:308](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L308)

Filter by shared status. Maps to `shareDetails.shared` in the API query.

***

### sharedCameraAccount?

> `optional` **sharedCameraAccount**: `string`

Defined in: [src/types/camera.ts:310](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L310)

Filter by sharing account ID. Maps to `shareDetails.accountId` in the API query.

***

### firstResponder?

> `optional` **firstResponder**: `boolean`

Defined in: [src/types/camera.ts:312](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L312)

Filter by first responder sharing. Maps to `shareDetails.firstResponder` in the API query.

***

### directToCloud?

> `optional` **directToCloud**: `boolean`

Defined in: [src/types/camera.ts:316](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L316)

Filter by direct-to-cloud connection. Maps to `deviceInfo.directToCloud` in the API query.

***

### speakerId\_\_in?

> `optional` **speakerId\_\_in**: `string`[]

Defined in: [src/types/camera.ts:320](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L320)

Filter by speaker IDs

***

### q?

> `optional` **q**: `string`

Defined in: [src/types/camera.ts:324](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L324)

Full-text search query

***

### qRelevance\_\_gte?

> `optional` **qRelevance\_\_gte**: `number`

Defined in: [src/types/camera.ts:326](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L326)

Minimum search relevance score

***

### enabledAnalytics\_\_contains?

> `optional` **enabledAnalytics\_\_contains**: `string`[]

Defined in: [src/types/camera.ts:330](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L330)

Filter by enabled analytics (all must be present)

***

### status\_\_in?

> `optional` **status\_\_in**: [`CameraStatus`](../type-aliases/CameraStatus.md)[]

Defined in: [src/types/camera.ts:334](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L334)

Filter by status values (any match)

***

### status\_\_ne?

> `optional` **status\_\_ne**: [`CameraStatus`](../type-aliases/CameraStatus.md)

Defined in: [src/types/camera.ts:336](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/types/camera.ts#L336)

Filter by status not equal to
