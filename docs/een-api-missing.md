# een-api-toolkit - Missing EEN API Endpoints

> Generated: 2026-02-21
> Coverage: 55 of 190 endpoints implemented (28.9%)
> Missing: 135 endpoints

---

## Devices - Cameras (12 of 15 missing)

Implemented: `GET /cameras`, `GET /cameras/{cameraId}`, `GET /cameras/{cameraId}/settings`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/cameras` | Associate a camera with the account |
| POST | `/cameras:bulkUpdate` | Update multiple cameras simultaneously |
| DELETE | `/cameras/{cameraId}` | Remove camera from account |
| PATCH | `/cameras/{cameraId}` | Update camera information |
| PUT | `/cameras/{cameraId}/tunnel` | Open camera tunnel for UI access |
| DELETE | `/cameras/{cameraId}/tunnel` | Close camera tunnel |
| GET | `/cameras/{cameraId}/metrics` | Retrieve camera metrics data |
| PATCH | `/cameras/{cameraId}:swap` | Replace camera with new device |
| GET | `/cameras/{cameraId}/io/ports` | List camera I/O ports |
| GET | `/cameras/{cameraId}/io/ports/{portId}` | Retrieve specific camera I/O port |
| PATCH | `/cameras/{cameraId}/io/ports/{portId}` | Update camera port configuration |
| PATCH | `/cameras/{cameraId}/settings` | Update camera settings |

## Devices - Bridges (9 of 11 missing)

Implemented: `GET /bridges`, `GET /bridges/{bridgeId}`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/bridges` | Create bridge for account |
| POST | `/bridges:bulkUpdate` | Update multiple bridges simultaneously |
| PATCH | `/bridges/{bridgeId}` | Update bridge information |
| DELETE | `/bridges/{bridgeId}` | Remove bridge from account |
| GET | `/bridges/{bridgeId}/metrics` | Retrieve bridge metrics |
| PATCH | `/bridges/{bridgeId}:swap` | Replace bridge with new device |
| POST | `/bridges/{bridgeId}/actions` | Execute bridge actions (e.g., reboot) |
| GET | `/bridges/{bridgeId}/settings` | Retrieve bridge operational settings |
| PATCH | `/bridges/{bridgeId}/settings` | Update bridge settings |

## Devices - Speakers (7 of 7 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/speakers` | List speakers with filtering and pagination |
| POST | `/speakers` | Create speaker device |
| GET | `/speakers/{speakerId}` | Retrieve specific speaker |
| PATCH | `/speakers/{speakerId}` | Update speaker information |
| DELETE | `/speakers/{speakerId}` | Remove speaker from account |
| GET | `/speakers/{speakerId}/settings` | Retrieve speaker settings |
| PATCH | `/speakers/{speakerId}/settings` | Update speaker settings |

## Devices - Device I/O (6 of 6 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/devices/{deviceId}/io/ports` | List device I/O ports |
| GET | `/devices/{deviceId}/io/ports/{portId}` | Retrieve specific I/O port |
| PATCH | `/devices/{deviceId}/io/ports/{portId}` | Update port configuration |
| GET | `/devices/{deviceId}/io/ports/{portId}/recordingActions` | List cameras recording on port trigger |
| GET | `/devices/{deviceId}/io/ports/{portId}/recordingActions/{cameraId}` | Retrieve a recording action |
| PATCH | `/devices/{deviceId}/io/ports/{portId}/recordingActions/{cameraId}` | Update a recording action |

## Devices - Switches (5 of 5 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/switches` | List switches with pagination |
| GET | `/switches/{switchId}` | Retrieve specific switch |
| PATCH | `/switches/{switchId}` | Update switch information |
| POST | `/switches/{switchId}/ports/{portId}/actions` | Control individual switch port |
| POST | `/switches/{switchId}/ports/all/actions` | Control all switch ports |

## Devices - Multi Cameras (6 of 6 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/multiCameras` | List multi-camera devices |
| POST | `/multiCameras` | Associate multi-camera with account |
| GET | `/multiCameras/{multiCameraId}` | Retrieve multi-camera details |
| DELETE | `/multiCameras/{multiCameraId}` | Remove multi-camera from account |
| PATCH | `/multiCameras/{multiCameraId}` | Update multi-camera information |
| GET | `/multiCameras/{multiCameraId}/channels` | Retrieve multi-camera channel information |

## Devices - Available Devices (1 of 1 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/availableDevices` | List undiscovered devices available for addition |

---

## Grouping - Tags (1 of 1 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tags` | Retrieve a list of all tags visible to the current user |

## Grouping - Locations (6 of 6 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations` | Retrieve a list of locations |
| POST | `/locations` | Create a new location |
| GET | `/locations/{id}` | Retrieve the location with a specific ID |
| PATCH | `/locations/{id}` | Update the location with the given ID |
| DELETE | `/locations/{id}` | Delete the location with the given ID |
| GET | `/locations/{id}/locations` | Retrieve child locations |

## Grouping - Floors (6 of 6 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}/floors` | Retrieve the floors at the given location |
| POST | `/locations/{locationId}/floors` | Create a floor |
| GET | `/locations/{locationId}/floors/{id}` | Retrieve a specific floor at a specific location |
| PATCH | `/locations/{locationId}/floors/{id}` | Update one or more fields of the given floor |
| DELETE | `/locations/{locationId}/floors/{id}` | Delete a specific floor of a specific location |
| GET | `/locations/{locationId}/floors/{id}.{type}` | Retrieve the floor image of a specific floor |

## Grouping - Floor Plans (3 of 3 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}/floors/{id}/plans` | Retrieve plans of a specific floor |
| POST | `/locations/{locationId}/floors/{id}/plans` | Create a floor plan for a specific floor |
| DELETE | `/locations/{locationId}/floors/{id}/plans/{planId}` | Delete a floor plan and its corresponding file |

---

## Media - Media (1 of 5 missing)

Implemented: `GET /media`, `GET /media/liveImage.jpeg`, `GET /media/recordedImage.jpeg`, `GET /media/session`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/media/recordedImage.jpeg:listFieldValues` | List available field values for recorded images |

## Media - Exports (1 of 2 missing)

Implemented: `POST /exports`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/exports/{jobId}:copy` | Retry export with modified parameters |

## Media - Files (6 of 11 missing)

Implemented: `GET /files`, `POST /files`, `GET /files/{id}`, `GET /files/{id}:download`, `DELETE /files/{id}`

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/files/{id}` | Modify file details |
| GET | `/deletedFiles` | List deleted files |
| GET | `/deletedFiles/{id}` | Get recycled item details |
| DELETE | `/deletedFiles/{id}` | Permanently delete item |
| DELETE | `/deletedFiles/all` | Clear recycle bin |
| POST | `/deletedFiles/{id}:restore` | Restore recycled item |

## Media - Downloads (1 of 4 missing)

Implemented: `GET /downloads`, `GET /downloads/{id}`, `GET /downloads/{id}:download`

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/downloads/{id}` | Modify download metadata |

---

## Events - Events (1 of 4 missing)

Implemented: `GET /events`, `GET /events/{id}`, `GET /events:listFieldValues`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/events` | Create a new event for the selected actor |

---

## Automations - Event Alert Condition Rules (3 of 6 missing)

Implemented: `GET /eventAlertConditionRules`, `GET /eventAlertConditionRules:listFieldValues`, `GET /eventAlertConditionRules/{id}`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/eventAlertConditionRules` | Create a new rule that produces alerts based on event conditions |
| PATCH | `/eventAlertConditionRules/{id}` | Update a specific alert condition rule |
| DELETE | `/eventAlertConditionRules/{id}` | Remove a specific alert condition rule |

## Automations - Alert Action Rules (3 of 5 missing)

Implemented: `GET /alertActionRules`, `GET /alertActionRules/{actionRuleId}`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/alertActionRules` | Register a new alert action rule with the account |
| PATCH | `/alertActionRules/{actionRuleId}` | Update a single alert action rule |
| DELETE | `/alertActionRules/{actionRuleId}` | Remove an alert action rule |

## Automations - Alert Actions (3 of 5 missing)

Implemented: `GET /alertActions`, `GET /alertActions/{actionId}`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/alertActions` | Register a new alert action with the account |
| PATCH | `/alertActions/{actionId}` | Update a single alert action |
| DELETE | `/alertActions/{actionId}` | Remove an alert action |

---

## Video Search - Video Analytic Events (7 of 7 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| POST | `/videoAnalyticEvents:parse` | Map natural language queries to object filters for deep search |
| POST | `/videoAnalyticEvents:deepSearch` | Fetch video analytic events matching defined filters |
| POST | `/videoAnalyticEvents:deepSearchGroupByResource` | Fetch event frequencies grouped by resource metadata |
| POST | `/videoAnalyticEvents:deepSearchGroupByTime` | Fetch event frequencies grouped in time periods |
| POST | `/videoAnalyticEvents:listFieldValues` | Retrieve available deep search query parameters |
| GET | `/videoAnalyticEvents:listObjectValues` | Fetch available filter attribute values for events |
| GET | `/videoAnalyticEvents/{id}` | Retrieve specific video analytics event by ID |

---

## Vehicle Surveillance - LPR Events (4 of 4 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lprEvents` | Fetch license plate recognition events with filtering |
| GET | `/lprEvents/{id}` | Retrieve a specific LPR event by ID |
| GET | `/lprEvents:summary` | Obtain aggregated counts of LPR events across time periods |
| GET | `/lprEvents:listFieldValues` | List all possible filter values for LPR event attributes |

## Vehicle Surveillance - LPR Alert Condition Rules (5 of 5 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| POST | `/lprAlertConditionRules` | Create a new rule for generating alerts based on LPR conditions |
| GET | `/lprAlertConditionRules` | Fetch LPR alert condition rules based on a filter |
| GET | `/lprAlertConditionRules:listFieldValues` | Return possible values across all rule attributes |
| GET | `/lprAlertConditionRules/{id}` | Retrieve details of a specific LPR rule |
| PATCH | `/lprAlertConditionRules/{id}` | Update specified properties of an existing LPR rule |

---

## User & Accounts - Users (6 of 9 missing)

Implemented: `GET /users/self`, `GET /users`, `GET /users/{userId}`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/users` | Create a new user (verification email sent, pending state) |
| DELETE | `/users/{userId}` | Delete a user and remove all related references |
| PATCH | `/users/{userId}` | Update a user's data |
| PATCH | `/users/self` | Update current user's profile data |
| GET | `/users/self/trustedClients` | Retrieve a list of trusted clients |
| DELETE | `/users/self/trustedClients/{trustedClientId}` | Delete a trusted client device |

## User & Accounts - Accounts (2 of 2 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts` | Retrieve a list of accounts the user has access to |
| DELETE | `/accounts/{id}/credentials/{credentialId}` | Remove a credential from the account |

## User & Accounts - Roles (8 of 8 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/roles` | Returns a list of all roles in current user's account |
| POST | `/roles` | Create a new role with defined permissions |
| GET | `/roles/{roleId}` | Retrieve a role by its ID |
| DELETE | `/roles/{roleId}` | Delete a role (only if unassigned) |
| PATCH | `/roles/{roleId}` | Update role information and permissions |
| GET | `/roleAssignments` | Returns a list of all role assignments |
| POST | `/roleAssignments:bulkcreate` | Create multiple role assignments in one request |
| POST | `/roleAssignments:bulkdelete` | Delete multiple role assignments in one request |

## User & Accounts - Audit Log (1 of 1 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auditLogs` | Filter audit events by userId, targetId, type, and timestamp range |

## User & Accounts - Resource Grants (3 of 3 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/resourceGrants` | Retrieve a list of resource grants |
| POST | `/resourceGrants:bulkCreate` | Create multiple resource grants in one request |
| POST | `/resourceGrants:bulkDelete` | Delete multiple resource grants in one request |

## User & Accounts - Editions (2 of 2 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/editions` | Retrieve available editions for the account |
| GET | `/editions/{id}` | Retrieve a specific edition by ID |

---

## Resellers - Authorization Tokens (1 of 1 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| POST | `/authorizationTokens` | Resellers retrieve access tokens for end-user accounts |

---

## Account Settings - SSO (2 of 2 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts/self/ssoAuthSettings` | Get Single Sign On Authentication Settings |
| PATCH | `/accounts/self/ssoAuthSettings` | Update Single Sign On Authentication Settings |

## Account Settings - Client Settings (1 of 1 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clientSettings` | Retrieve settings required to let the client use the API |

---

## System - Applications (5 of 5 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications` | Retrieve all applications accessible by the requesting user |
| POST | `/applications` | Create new application under user's account |
| GET | `/applications/{applicationId}` | Retrieve a single application |
| PATCH | `/applications/{applicationId}` | Update a single application |
| DELETE | `/applications/{applicationId}` | Delete a single application |

## System - OAuth Clients (5 of 5 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications/{applicationId}/oauthClients` | Retrieve all OAuth credentials for the given application |
| POST | `/applications/{applicationId}/oauthClients` | Create OAuth client for application |
| GET | `/applications/{applicationId}/oauthClients/{clientId}` | Retrieve a specific OAuth client |
| PATCH | `/applications/{applicationId}/oauthClients/{clientId}` | Update a specific OAuth client |
| DELETE | `/applications/{applicationId}/oauthClients/{clientId}` | Delete a specific OAuth client |

## System - Reference Data (2 of 2 missing)

Implemented: none

| Method | Path | Description |
|--------|------|-------------|
| GET | `/languages` | Retrieve a list of languages supported by the service |
| GET | `/timeZones` | Retrieve a list of the supported time zones |

---

## Summary

### Coverage by Category

| Category | Implemented | Missing | Total | Coverage |
|----------|-------------|---------|-------|---------|
| Devices - Cameras | 3 | 12 | 15 | 20% |
| Devices - Bridges | 2 | 9 | 11 | 18% |
| Devices - PTZ | 4 | 0 | 4 | 100% |
| Devices - Speakers | 0 | 7 | 7 | 0% |
| Devices - Device I/O | 0 | 6 | 6 | 0% |
| Devices - Switches | 0 | 5 | 5 | 0% |
| Devices - Multi Cameras | 0 | 6 | 6 | 0% |
| Devices - Available Devices | 0 | 1 | 1 | 0% |
| Grouping - Layouts | 5 | 0 | 5 | 100% |
| Grouping - Tags | 0 | 1 | 1 | 0% |
| Grouping - Locations | 0 | 6 | 6 | 0% |
| Grouping - Floors | 0 | 6 | 6 | 0% |
| Grouping - Floor Plans | 0 | 3 | 3 | 0% |
| Media - Media | 4 | 1 | 5 | 80% |
| Media - Feeds | 1 | 0 | 1 | 100% |
| Media - Exports | 1 | 1 | 2 | 50% |
| Media - Jobs | 3 | 0 | 3 | 100% |
| Media - Files | 5 | 6 | 11 | 45% |
| Media - Downloads | 3 | 1 | 4 | 75% |
| Events - Events | 3 | 1 | 4 | 75% |
| Events - Event Types | 1 | 0 | 1 | 100% |
| Events - Event Metrics | 1 | 0 | 1 | 100% |
| Events - Event Subscriptions | 4 | 0 | 4 | 100% |
| Events - Alerts | 3 | 0 | 3 | 100% |
| Events - Notifications | 2 | 0 | 2 | 100% |
| Automations - Event Alert Condition Rules | 3 | 3 | 6 | 50% |
| Automations - Alert Action Rules | 2 | 3 | 5 | 40% |
| Automations - Alert Actions | 2 | 3 | 5 | 40% |
| Video Search - Video Analytic Events | 0 | 7 | 7 | 0% |
| Vehicle Surveillance - LPR Events | 0 | 4 | 4 | 0% |
| Vehicle Surveillance - LPR Alert Condition Rules | 0 | 5 | 5 | 0% |
| User & Accounts - Users | 3 | 6 | 9 | 33% |
| User & Accounts - Accounts | 0 | 2 | 2 | 0% |
| User & Accounts - Roles | 0 | 8 | 8 | 0% |
| User & Accounts - Audit Log | 0 | 1 | 1 | 0% |
| User & Accounts - Resource Grants | 0 | 3 | 3 | 0% |
| User & Accounts - Editions | 0 | 2 | 2 | 0% |
| Resellers - Authorization Tokens | 0 | 1 | 1 | 0% |
| Account Settings - SSO | 0 | 2 | 2 | 0% |
| Account Settings - Client Settings | 0 | 1 | 1 | 0% |
| System - Applications | 0 | 5 | 5 | 0% |
| System - OAuth Clients | 0 | 5 | 5 | 0% |
| System - Reference Data | 0 | 2 | 2 | 0% |
| **TOTAL** | **55** | **135** | **190** | **28.9%** |

### Fully Implemented Sections (100% coverage)

- Devices - PTZ (4/4)
- Grouping - Layouts (5/5)
- Media - Feeds (1/1)
- Media - Jobs (3/3)
- Events - Event Types (1/1)
- Events - Event Metrics (1/1)
- Events - Event Subscriptions (4/4)
- Events - Alerts (3/3)
- Events - Notifications (2/2)

### Entirely Missing Sections (0% coverage)

- Devices - Speakers
- Devices - Device I/O
- Devices - Switches
- Devices - Multi Cameras
- Devices - Available Devices
- Grouping - Tags
- Grouping - Locations
- Grouping - Floors
- Grouping - Floor Plans
- Video Search - Video Analytic Events
- Vehicle Surveillance - LPR Events
- Vehicle Surveillance - LPR Alert Condition Rules
- User & Accounts - Accounts
- User & Accounts - Roles
- User & Accounts - Audit Log
- User & Accounts - Resource Grants
- User & Accounts - Editions
- Resellers - Authorization Tokens
- Account Settings - SSO
- Account Settings - Client Settings
- System - Applications
- System - OAuth Clients
- System - Reference Data
