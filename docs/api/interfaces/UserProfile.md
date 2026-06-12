[**EEN API Toolkit v0.3.106**](../README.md)

***

[EEN API Toolkit](../README.md) / UserProfile

# Interface: UserProfile

Defined in: [types/user.ts:53](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L53)

Current authenticated user profile.

## Remarks

A subset of user information returned for the currently authenticated user.
This is returned by [getCurrentUser](../functions/getCurrentUser.md) and stored in the auth store.

## Properties

### id

> **id**: `string`

Defined in: [types/user.ts:55](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L55)

Unique identifier for the user

***

### email

> **email**: `string`

Defined in: [types/user.ts:57](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L57)

User's email address

***

### firstName

> **firstName**: `string`

Defined in: [types/user.ts:59](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L59)

User's first name

***

### lastName

> **lastName**: `string`

Defined in: [types/user.ts:61](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L61)

User's last name

***

### accountId?

> `optional` **accountId?**: `string`

Defined in: [types/user.ts:63](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L63)

ID of the account this user belongs to

***

### timeZone?

> `optional` **timeZone?**: `string`

Defined in: [types/user.ts:65](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L65)

User's timezone

***

### language?

> `optional` **language?**: `string`

Defined in: [types/user.ts:67](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L67)

User's preferred language
