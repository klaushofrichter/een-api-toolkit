[**EEN API Toolkit v0.3.102**](../README.md)

***

[EEN API Toolkit](../README.md) / User

# Interface: User

Defined in: [types/user.ts:13](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L13)

User entity from EEN API v3.0.

## Remarks

Represents a user in the Eagle Eye Networks platform. Users belong to accounts
and have various permissions that control their access to cameras and features.

For more details on user management, see the
[EEN API Documentation](https://developer.eagleeyenetworks.com/reference/getusers).

## Properties

### id

> **id**: `string`

Defined in: [types/user.ts:15](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L15)

Unique identifier for the user

***

### email

> **email**: `string`

Defined in: [types/user.ts:17](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L17)

User's email address (used for login)

***

### firstName

> **firstName**: `string`

Defined in: [types/user.ts:19](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L19)

User's first name

***

### lastName

> **lastName**: `string`

Defined in: [types/user.ts:21](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L21)

User's last name

***

### accountId?

> `optional` **accountId**: `string`

Defined in: [types/user.ts:23](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L23)

ID of the account this user belongs to

***

### timeZone?

> `optional` **timeZone**: `string`

Defined in: [types/user.ts:25](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L25)

User's timezone (IANA timezone name, e.g., "America/Los_Angeles")

***

### language?

> `optional` **language**: `string`

Defined in: [types/user.ts:27](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L27)

User's preferred language (ISO 639-1 code, e.g., "en")

***

### phone?

> `optional` **phone**: `string`

Defined in: [types/user.ts:29](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L29)

User's phone number

***

### mobilePhone?

> `optional` **mobilePhone**: `string`

Defined in: [types/user.ts:31](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L31)

User's mobile phone number

***

### permissions?

> `optional` **permissions**: `string`[]

Defined in: [types/user.ts:33](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L33)

List of permission strings assigned to this user

***

### lastLogin?

> `optional` **lastLogin**: `string`

Defined in: [types/user.ts:35](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L35)

ISO 8601 timestamp of the user's last login

***

### isActive?

> `optional` **isActive**: `boolean`

Defined in: [types/user.ts:37](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L37)

Whether the user account is active

***

### createdAt?

> `optional` **createdAt**: `string`

Defined in: [types/user.ts:39](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L39)

ISO 8601 timestamp when the user was created

***

### updatedAt?

> `optional` **updatedAt**: `string`

Defined in: [types/user.ts:41](https://github.com/klaushofrichter/een-api-toolkit/blob/production/src/types/user.ts#L41)

ISO 8601 timestamp when the user was last updated
