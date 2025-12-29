[**EEN API Toolkit v0.0.13**](../README.md)

***

[EEN API Toolkit](../README.md) / ListCamerasParams

# Interface: ListCamerasParams

Defined in: src/types/camera.ts:251

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

Defined in: src/types/camera.ts:254

Number of results per page (default: 100, max: 1000)

***

### pageToken?

> `optional` **pageToken**: `string`

Defined in: src/types/camera.ts:256

Token for fetching a specific page

***

### include?

> `optional` **include**: `string`[]

Defined in: src/types/camera.ts:260

Additional fields to include in the response

***

### sort?

> `optional` **sort**: `string`[]

Defined in: src/types/camera.ts:262

Fields to sort by (prefix with - for descending)

***

### locationId\_\_in?

> `optional` **locationId\_\_in**: `string`[]

Defined in: src/types/camera.ts:266

Filter by location IDs

***

### bridgeId\_\_in?

> `optional` **bridgeId\_\_in**: `string`[]

Defined in: src/types/camera.ts:268

Filter by bridge IDs

***

### multiCameraId?

> `optional` **multiCameraId**: `string`

Defined in: src/types/camera.ts:272

Filter by exact multi-camera ID

***

### multiCameraId\_\_ne?

> `optional` **multiCameraId\_\_ne**: `string`

Defined in: src/types/camera.ts:274

Filter by multi-camera ID not equal to

***

### multiCameraId\_\_in?

> `optional` **multiCameraId\_\_in**: `string`[]

Defined in: src/types/camera.ts:276

Filter by multi-camera IDs (any match)

***

### tags\_\_contains?

> `optional` **tags\_\_contains**: `string`[]

Defined in: src/types/camera.ts:280

Filter by tags (all tags must be present)

***

### tags\_\_any?

> `optional` **tags\_\_any**: `string`[]

Defined in: src/types/camera.ts:282

Filter by tags (any tag must be present)

***

### packages\_\_contains?

> `optional` **packages\_\_contains**: `string`[]

Defined in: src/types/camera.ts:284

Filter by packages (all must be present)

***

### name?

> `optional` **name**: `string`

Defined in: src/types/camera.ts:288

Filter by exact name

***

### name\_\_contains?

> `optional` **name\_\_contains**: `string`

Defined in: src/types/camera.ts:290

Filter by name containing substring (case-insensitive)

***

### name\_\_in?

> `optional` **name\_\_in**: `string`[]

Defined in: src/types/camera.ts:292

Filter by exact names (any match)

***

### id\_\_in?

> `optional` **id\_\_in**: `string`[]

Defined in: src/types/camera.ts:296

Filter by camera IDs

***

### id\_\_notIn?

> `optional` **id\_\_notIn**: `string`[]

Defined in: src/types/camera.ts:298

Exclude camera IDs

***

### id\_\_contains?

> `optional` **id\_\_contains**: `string`

Defined in: src/types/camera.ts:300

Filter by ID containing substring

***

### layoutId?

> `optional` **layoutId**: `string`

Defined in: src/types/camera.ts:304

Filter by layout ID

***

### shared?

> `optional` **shared**: `boolean`

Defined in: src/types/camera.ts:308

Filter by shared status

***

### sharedCameraAccount?

> `optional` **sharedCameraAccount**: `string`

Defined in: src/types/camera.ts:310

Filter by sharing account ID

***

### firstResponder?

> `optional` **firstResponder**: `boolean`

Defined in: src/types/camera.ts:312

Filter by first responder sharing

***

### directToCloud?

> `optional` **directToCloud**: `boolean`

Defined in: src/types/camera.ts:316

Filter by direct-to-cloud connection

***

### speakerId\_\_in?

> `optional` **speakerId\_\_in**: `string`[]

Defined in: src/types/camera.ts:320

Filter by speaker IDs

***

### q?

> `optional` **q**: `string`

Defined in: src/types/camera.ts:324

Full-text search query

***

### qRelevance\_\_gte?

> `optional` **qRelevance\_\_gte**: `number`

Defined in: src/types/camera.ts:326

Minimum search relevance score

***

### enabledAnalytics\_\_contains?

> `optional` **enabledAnalytics\_\_contains**: `string`[]

Defined in: src/types/camera.ts:330

Filter by enabled analytics (all must be present)

***

### status\_\_in?

> `optional` **status\_\_in**: [`CameraStatus`](../type-aliases/CameraStatus.md)[]

Defined in: src/types/camera.ts:334

Filter by status values (any match)

***

### status\_\_ne?

> `optional` **status\_\_ne**: [`CameraStatus`](../type-aliases/CameraStatus.md)

Defined in: src/types/camera.ts:336

Filter by status not equal to
