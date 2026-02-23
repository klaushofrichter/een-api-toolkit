[**EEN API Toolkit v0.3.100**](../README.md)

***

[EEN API Toolkit](../README.md) / Download

# Interface: Download

Defined in: [types/download.ts:34](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L34)

Download entity from EEN API v3.0.

## Remarks

Represents a downloadable item in the Eagle Eye Networks platform.
Downloads may expire after a certain time period.

## Example

```typescript
import { listDownloads, type Download } from 'een-api-toolkit'

const { data, error } = await listDownloads({ status__in: ['available'] })
if (data) {
  data.results.forEach((download: Download) => {
    console.log(`${download.name}: ${download.status}`)
  })
}
```

## Properties

### id

> **id**: `string`

Defined in: [types/download.ts:36](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L36)

Unique identifier for the download

***

### accountId

> **accountId**: `string`

Defined in: [types/download.ts:38](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L38)

ID of the account this download belongs to

***

### name

> **name**: `string`

Defined in: [types/download.ts:40](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L40)

Display name of the download

***

### status

> **status**: [`DownloadStatus`](../type-aliases/DownloadStatus.md)

Defined in: [types/download.ts:42](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L42)

Current status of the download

***

### contentType?

> `optional` **contentType**: `string`

Defined in: [types/download.ts:44](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L44)

MIME content type (e.g., 'video/mp4')

***

### sizeBytes?

> `optional` **sizeBytes**: `number`

Defined in: [types/download.ts:46](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L46)

File size in bytes

***

### fileId?

> `optional` **fileId**: `string`

Defined in: [types/download.ts:48](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L48)

ID of the related file

***

### jobId?

> `optional` **jobId**: `string`

Defined in: [types/download.ts:50](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L50)

ID of the job that created this download

***

### cameraId?

> `optional` **cameraId**: `string`

Defined in: [types/download.ts:52](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L52)

ID of the camera this download relates to

***

### description?

> `optional` **description**: `string`

Defined in: [types/download.ts:54](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L54)

Description or notes

***

### createTimestamp

> **createTimestamp**: `string`

Defined in: [types/download.ts:56](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L56)

ISO 8601 timestamp when the download was created

***

### expirationTimestamp?

> `optional` **expirationTimestamp**: `string`

Defined in: [types/download.ts:58](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L58)

ISO 8601 timestamp when the download expires

***

### downloadUrl?

> `optional` **downloadUrl**: `string`

Defined in: [types/download.ts:60](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/download.ts#L60)

Download URL (may be pre-signed)
