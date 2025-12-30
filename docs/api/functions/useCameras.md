[**EEN API Toolkit v0.0.15**](../README.md)

***

[EEN API Toolkit](../README.md) / useCameras

# Function: useCameras()

> **useCameras**(`initialParams?`, `options?`): `object`

Defined in: [src/cameras/composables.ts:72](https://github.com/klaushofrichter/een-api-toolkit/blob/develop/src/cameras/composables.ts#L72)

Vue 3 composable for listing cameras with pagination.

## Parameters

### initialParams?

[`ListCamerasParams`](../interfaces/ListCamerasParams.md)

Initial pagination/filter parameters

### options?

[`UseCamerasOptions`](../interfaces/UseCamerasOptions.md)

Configuration options

## Returns

Reactive cameras state and pagination controls

### cameras

> **cameras**: `Ref`\<`object`[], [`Camera`](../interfaces/Camera.md)[] \| `object`[]\>

Array of cameras for the current page

### loading

> **loading**: `Ref`\<`boolean`, `boolean`\>

Whether a fetch is in progress

### error

> **error**: `Ref`\<\{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`, [`EenError`](../interfaces/EenError.md) \| \{ `code`: [`ErrorCode`](../type-aliases/ErrorCode.md); `message`: `string`; `status?`: `number`; `details?`: `unknown`; \} \| `null`\>

The last error that occurred, or null if successful

### nextPageToken

> **nextPageToken**: `Ref`\<`string` \| `undefined`, `string` \| `undefined`\>

Token for fetching the next page

### prevPageToken

> **prevPageToken**: `Ref`\<`string` \| `undefined`, `string` \| `undefined`\>

Token for fetching the previous page

### totalSize

> **totalSize**: `Ref`\<`number` \| `undefined`, `number` \| `undefined`\>

Total number of cameras (if provided by API)

### hasNextPage

> **hasNextPage**: `ComputedRef`\<`boolean`\>

Whether there is a next page available

### hasPrevPage

> **hasPrevPage**: `ComputedRef`\<`boolean`\>

Whether there is a previous page available

### params

> **params**: `Ref`\<\{ `pageSize?`: `number`; `pageToken?`: `string`; `include?`: `string`[]; `sort?`: `string`[]; `locationId__in?`: `string`[]; `bridgeId__in?`: `string`[]; `multiCameraId?`: `string`; `multiCameraId__ne?`: `string`; `multiCameraId__in?`: `string`[]; `tags__contains?`: `string`[]; `tags__any?`: `string`[]; `packages__contains?`: `string`[]; `name?`: `string`; `name__contains?`: `string`; `name__in?`: `string`[]; `id__in?`: `string`[]; `id__notIn?`: `string`[]; `id__contains?`: `string`; `layoutId?`: `string`; `shared?`: `boolean`; `sharedCameraAccount?`: `string`; `firstResponder?`: `boolean`; `directToCloud?`: `boolean`; `speakerId__in?`: `string`[]; `q?`: `string`; `qRelevance__gte?`: `number`; `enabledAnalytics__contains?`: `string`[]; `status__in?`: [`CameraStatus`](../type-aliases/CameraStatus.md)[]; `status__ne?`: [`CameraStatus`](../type-aliases/CameraStatus.md); \}, [`ListCamerasParams`](../interfaces/ListCamerasParams.md) \| \{ `pageSize?`: `number`; `pageToken?`: `string`; `include?`: `string`[]; `sort?`: `string`[]; `locationId__in?`: `string`[]; `bridgeId__in?`: `string`[]; `multiCameraId?`: `string`; `multiCameraId__ne?`: `string`; `multiCameraId__in?`: `string`[]; `tags__contains?`: `string`[]; `tags__any?`: `string`[]; `packages__contains?`: `string`[]; `name?`: `string`; `name__contains?`: `string`; `name__in?`: `string`[]; `id__in?`: `string`[]; `id__notIn?`: `string`[]; `id__contains?`: `string`; `layoutId?`: `string`; `shared?`: `boolean`; `sharedCameraAccount?`: `string`; `firstResponder?`: `boolean`; `directToCloud?`: `boolean`; `speakerId__in?`: `string`[]; `q?`: `string`; `qRelevance__gte?`: `number`; `enabledAnalytics__contains?`: `string`[]; `status__in?`: [`CameraStatus`](../type-aliases/CameraStatus.md)[]; `status__ne?`: [`CameraStatus`](../type-aliases/CameraStatus.md); \}\>

Current pagination/filter parameters

### fetch()

> **fetch**: (`fetchParams?`) => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\>\>

#### Parameters

##### fetchParams?

[`ListCamerasParams`](../interfaces/ListCamerasParams.md)

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\>\>

### refresh()

> **refresh**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\>\>

Refresh the current page

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\>\>

### fetchNextPage()

> **fetchNextPage**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\> \| `undefined`\>

Fetch the next page of results

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\> \| `undefined`\>

### fetchPrevPage()

> **fetchPrevPage**: () => `Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\> \| `undefined`\>

Fetch the previous page of results

#### Returns

`Promise`\<[`Result`](../type-aliases/Result.md)\<[`PaginatedResult`](../interfaces/PaginatedResult.md)\<[`Camera`](../interfaces/Camera.md)\>\> \| `undefined`\>

### setParams()

> **setParams**: (`newParams`) => `void`

Update the pagination/filter parameters

#### Parameters

##### newParams

[`ListCamerasParams`](../interfaces/ListCamerasParams.md)

#### Returns

`void`

## Remarks

Provides reactive access to a paginated list of cameras with built-in
pagination controls. Automatically fetches on mount unless disabled.

## Examples

```vue
<script setup>
import { useCameras } from 'een-api-toolkit'

const {
  cameras,
  loading,
  error,
  hasNextPage,
  fetchNextPage,
  refresh
} = useCameras({ pageSize: 20, status__in: ['online'] })
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>
    <ul>
      <li v-for="camera in cameras" :key="camera.id">
        {{ camera.name }} ({{ camera.status }})
      </li>
    </ul>
    <button v-if="hasNextPage" @click="fetchNextPage">Load More</button>
    <button @click="refresh">Refresh</button>
  </div>
</template>
```

```typescript
// Change parameters dynamically
const { cameras, setParams, fetch } = useCameras()

async function filterByStatus(status: string) {
  setParams({ pageSize: 50, status__in: [status] })
  await fetch()
}
```
