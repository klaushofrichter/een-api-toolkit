[**EEN API Toolkit v0.3.41**](../README.md)

***

[EEN API Toolkit](../README.md) / ListCamerasParams

# Interface: ListCamerasParams

Defined in: [src/types/camera.ts:273](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L273)

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

Defined in: [src/types/camera.ts:276](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L276)

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: [src/types/camera.ts:278](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L278)

Token for fetching a specific page

***

### include?

> `optional` **include**: `string`[]

Defined in: [src/types/camera.ts:282](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L282)

Additional fields to include in the response

***

### sort?

> `optional` **sort**: `string`[]

Defined in: [src/types/camera.ts:284](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L284)

Fields to sort by (prefix with - for descending)

***

### locationId\_\_in?

> `optional` **locationId\_\_in**: `string`[]

Defined in: [src/types/camera.ts:288](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L288)

Filter by location IDs

***

### bridgeId\_\_in?

> `optional` **bridgeId\_\_in**: `string`[]

Defined in: [src/types/camera.ts:290](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L290)

Filter by bridge IDs

***

### multiCameraId?

> `optional` **multiCameraId**: `string`

Defined in: [src/types/camera.ts:294](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L294)

Filter by exact multi-camera ID

***

### multiCameraId\_\_ne?

> `optional` **multiCameraId\_\_ne**: `string`

Defined in: [src/types/camera.ts:296](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L296)

Filter by multi-camera ID not equal to

***

### multiCameraId\_\_in?

> `optional` **multiCameraId\_\_in**: `string`[]

Defined in: [src/types/camera.ts:298](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L298)

Filter by multi-camera IDs (any match)

***

### tags\_\_contains?

> `optional` **tags\_\_contains**: `string`[]

Defined in: [src/types/camera.ts:302](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L302)

Filter by tags (all tags must be present)

***

### tags\_\_any?

> `optional` **tags\_\_any**: `string`[]

Defined in: [src/types/camera.ts:304](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L304)

Filter by tags (any tag must be present)

***

### packages\_\_contains?

> `optional` **packages\_\_contains**: `string`[]

Defined in: [src/types/camera.ts:306](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L306)

Filter by packages (all must be present)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/camera.ts:310](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L310)

Filter by exact name

***

### name\_\_contains?

> `optional` **name\_\_contains**: `string`

Defined in: [src/types/camera.ts:312](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L312)

Filter by name containing substring (case-insensitive)

***

### name\_\_in?

> `optional` **name\_\_in**: `string`[]

Defined in: [src/types/camera.ts:314](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L314)

Filter by exact names (any match)

***

### id\_\_in?

> `optional` **id\_\_in**: `string`[]

Defined in: [src/types/camera.ts:318](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L318)

Filter by camera IDs

***

### id\_\_notIn?

> `optional` **id\_\_notIn**: `string`[]

Defined in: [src/types/camera.ts:320](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L320)

Exclude camera IDs

***

### id\_\_contains?

> `optional` **id\_\_contains**: `string`

Defined in: [src/types/camera.ts:322](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L322)

Filter by ID containing substring

***

### layoutId?

> `optional` **layoutId**: `string`

Defined in: [src/types/camera.ts:326](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L326)

Filter by layout ID

***

### shared?

> `optional` **shared**: `boolean`

Defined in: [src/types/camera.ts:330](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L330)

Filter by shared status. Maps to `shareDetails.shared` in the API query.

***

### sharedCameraAccount?

> `optional` **sharedCameraAccount**: `string`

Defined in: [src/types/camera.ts:332](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L332)

Filter by sharing account ID. Maps to `shareDetails.accountId` in the API query.

***

### firstResponder?

> `optional` **firstResponder**: `boolean`

Defined in: [src/types/camera.ts:334](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L334)

Filter by first responder sharing. Maps to `shareDetails.firstResponder` in the API query.

***

### directToCloud?

> `optional` **directToCloud**: `boolean`

Defined in: [src/types/camera.ts:338](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L338)

Filter by direct-to-cloud connection. Maps to `deviceInfo.directToCloud` in the API query.

***

### speakerId\_\_in?

> `optional` **speakerId\_\_in**: `string`[]

Defined in: [src/types/camera.ts:342](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L342)

Filter by speaker IDs

***

### q?

> `optional` **q**: `string`

Defined in: [src/types/camera.ts:346](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L346)

Full-text search query

***

### qRelevance\_\_gte?

> `optional` **qRelevance\_\_gte**: `number`

Defined in: [src/types/camera.ts:348](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L348)

Minimum search relevance score

***

### enabledAnalytics\_\_contains?

> `optional` **enabledAnalytics\_\_contains**: `string`[]

Defined in: [src/types/camera.ts:352](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L352)

Filter by enabled analytics (all must be present)

***

### status\_\_in?

> `optional` **status\_\_in**: [`CameraStatus`](../type-aliases/CameraStatus.md)[]

Defined in: [src/types/camera.ts:356](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L356)

Filter by status values (any match)

***

### status\_\_ne?

> `optional` **status\_\_ne**: [`CameraStatus`](../type-aliases/CameraStatus.md)

Defined in: [src/types/camera.ts:358](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/camera.ts#L358)

Filter by status not equal to
