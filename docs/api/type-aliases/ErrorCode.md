[**EEN API Toolkit v0.3.85**](../README.md)

***

[EEN API Toolkit](../README.md) / ErrorCode

# Type Alias: ErrorCode

> **ErrorCode** = `"AUTH_REQUIRED"` \| `"AUTH_FAILED"` \| `"TOKEN_EXPIRED"` \| `"API_ERROR"` \| `"NETWORK_ERROR"` \| `"VALIDATION_ERROR"` \| `"NOT_FOUND"` \| `"FORBIDDEN"` \| `"RATE_LIMITED"` \| `"SERVICE_UNAVAILABLE"` \| `"UNKNOWN_ERROR"`

Defined in: [types/common.ts:10](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/common.ts#L10)

Error codes returned by the toolkit.

## Remarks

All API functions return a [Result](Result.md) type that contains either data or an error.
The error code helps you determine how to handle the failure.
