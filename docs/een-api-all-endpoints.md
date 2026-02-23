# Eagle Eye Networks REST API v3.0 - Complete Endpoint Reference

> Generated: 2026-02-21
> Source: [EEN Developer Portal](https://developer.eagleeyenetworks.com/reference/using-the-api) and [OpenAPI Specifications](https://github.com/EENCloud/VMS-Developer-Portal/tree/main/Open%20API%20Specifications)

All paths are prefixed with `/api/v3.0` on the appropriate base URL (e.g., `https://c001.eagleeyenetworks.com`).

---

## Devices - Cameras (15 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cameras` | List cameras with filtering, pagination, and include options |
| POST | `/cameras` | Associate a camera with the account |
| POST | `/cameras:bulkUpdate` | Update multiple cameras simultaneously |
| GET | `/cameras/{cameraId}` | Retrieve specific camera details |
| DELETE | `/cameras/{cameraId}` | Remove camera from account |
| PATCH | `/cameras/{cameraId}` | Update camera information |
| PUT | `/cameras/{cameraId}/tunnel` | Open camera tunnel for UI access |
| DELETE | `/cameras/{cameraId}/tunnel` | Close camera tunnel |
| GET | `/cameras/{cameraId}/metrics` | Retrieve camera metrics data |
| PATCH | `/cameras/{cameraId}:swap` | Replace camera with new device |
| GET | `/cameras/{cameraId}/io/ports` | List camera I/O ports |
| GET | `/cameras/{cameraId}/io/ports/{portId}` | Retrieve specific camera I/O port |
| PATCH | `/cameras/{cameraId}/io/ports/{portId}` | Update camera port configuration |
| GET | `/cameras/{cameraId}/settings` | Retrieve camera settings |
| PATCH | `/cameras/{cameraId}/settings` | Update camera settings |

## Devices - Bridges (11 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/bridges` | List bridges with filtering and pagination |
| POST | `/bridges` | Create bridge for account |
| POST | `/bridges:bulkUpdate` | Update multiple bridges simultaneously |
| GET | `/bridges/{bridgeId}` | Retrieve specific bridge |
| PATCH | `/bridges/{bridgeId}` | Update bridge information |
| DELETE | `/bridges/{bridgeId}` | Remove bridge from account |
| GET | `/bridges/{bridgeId}/metrics` | Retrieve bridge metrics |
| PATCH | `/bridges/{bridgeId}:swap` | Replace bridge with new device |
| POST | `/bridges/{bridgeId}/actions` | Execute bridge actions (e.g., reboot) |
| GET | `/bridges/{bridgeId}/settings` | Retrieve bridge operational settings |
| PATCH | `/bridges/{bridgeId}/settings` | Update bridge settings |

## Devices - PTZ (4 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cameras/{cameraId}/ptz/position` | Retrieve current PTZ position |
| PUT | `/cameras/{cameraId}/ptz/position` | Move camera to position or direction |
| GET | `/cameras/{cameraId}/ptz/settings` | Retrieve PTZ settings and presets |
| PATCH | `/cameras/{cameraId}/ptz/settings` | Update PTZ settings and presets |

## Devices - Speakers (7 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/speakers` | List speakers with filtering and pagination |
| POST | `/speakers` | Create speaker device |
| GET | `/speakers/{speakerId}` | Retrieve specific speaker |
| PATCH | `/speakers/{speakerId}` | Update speaker information |
| DELETE | `/speakers/{speakerId}` | Remove speaker from account |
| GET | `/speakers/{speakerId}/settings` | Retrieve speaker settings |
| PATCH | `/speakers/{speakerId}/settings` | Update speaker settings |

## Devices - Device I/O (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/devices/{deviceId}/io/ports` | List device I/O ports |
| GET | `/devices/{deviceId}/io/ports/{portId}` | Retrieve specific I/O port |
| PATCH | `/devices/{deviceId}/io/ports/{portId}` | Update port configuration |
| GET | `/devices/{deviceId}/io/ports/{portId}/recordingActions` | List cameras recording on port trigger |
| GET | `/devices/{deviceId}/io/ports/{portId}/recordingActions/{cameraId}` | Retrieve a recording action |
| PATCH | `/devices/{deviceId}/io/ports/{portId}/recordingActions/{cameraId}` | Update a recording action |

## Devices - Switches (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/switches` | List switches with pagination |
| GET | `/switches/{switchId}` | Retrieve specific switch |
| PATCH | `/switches/{switchId}` | Update switch information |
| POST | `/switches/{switchId}/ports/{portId}/actions` | Control individual switch port |
| POST | `/switches/{switchId}/ports/all/actions` | Control all switch ports |

## Devices - Multi Cameras (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/multiCameras` | List multi-camera devices |
| POST | `/multiCameras` | Associate multi-camera with account |
| GET | `/multiCameras/{multiCameraId}` | Retrieve multi-camera details |
| DELETE | `/multiCameras/{multiCameraId}` | Remove multi-camera from account |
| PATCH | `/multiCameras/{multiCameraId}` | Update multi-camera information |
| GET | `/multiCameras/{multiCameraId}/channels` | Retrieve multi-camera channel information |

## Devices - Available Devices (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/availableDevices` | List undiscovered devices available for addition |

---

## Grouping - Layouts (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/layouts` | Retrieve all layouts associated with the account |
| POST | `/layouts` | Create a layout |
| GET | `/layouts/{layoutId}` | Retrieve info of a specific layout |
| PATCH | `/layouts/{layoutId}` | Update a specific layout |
| DELETE | `/layouts/{layoutId}` | Delete an existing layout |

## Grouping - Tags (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tags` | Retrieve a list of all tags visible to the current user |

## Grouping - Locations (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations` | Retrieve a list of locations |
| POST | `/locations` | Create a new location |
| GET | `/locations/{id}` | Retrieve the location with a specific ID |
| PATCH | `/locations/{id}` | Update the location with the given ID |
| DELETE | `/locations/{id}` | Delete the location with the given ID |
| GET | `/locations/{id}/locations` | Retrieve child locations |

## Grouping - Floors (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}/floors` | Retrieve the floors at the given location |
| POST | `/locations/{locationId}/floors` | Create a floor |
| GET | `/locations/{locationId}/floors/{id}` | Retrieve a specific floor at a specific location |
| PATCH | `/locations/{locationId}/floors/{id}` | Update one or more fields of the given floor |
| DELETE | `/locations/{locationId}/floors/{id}` | Delete a specific floor of a specific location |
| GET | `/locations/{locationId}/floors/{id}.{type}` | Retrieve the floor image of a specific floor |

## Grouping - Floor Plans (3 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}/floors/{id}/plans` | Retrieve plans of a specific floor |
| POST | `/locations/{locationId}/floors/{id}/plans` | Create a floor plan for a specific floor |
| DELETE | `/locations/{locationId}/floors/{id}/plans/{planId}` | Delete a floor plan and its corresponding file |

---

## Media - Media (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/media` | List recording intervals for given type and mediaType |
| GET | `/media/recordedImage.jpeg` | Retrieve image at specified timestamp |
| GET | `/media/recordedImage.jpeg:listFieldValues` | List available field values for recorded images |
| GET | `/media/liveImage.jpeg` | Get new image from device |
| GET | `/media/session` | Get URL to set media session cookie |

## Media - Feeds (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/feeds` | List feeds generated by device(s) |

## Media - Exports (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/exports` | Create and start new video export job |
| POST | `/exports/{jobId}:copy` | Retry export with modified parameters |

## Media - Jobs (3 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/jobs` | List jobs with filtering options |
| GET | `/jobs/{jobId}` | Get single job details |
| DELETE | `/jobs/{jobId}` | Delete job regardless of state |

## Media - Files (11 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/files` | List archived items |
| POST | `/files` | Add new file to archive |
| GET | `/files/{id}` | Get file details by ID |
| PATCH | `/files/{id}` | Modify file details |
| DELETE | `/files/{id}` | Recycle item by ID |
| GET | `/files/{id}:download` | Download file or folder |
| GET | `/deletedFiles` | List deleted files |
| GET | `/deletedFiles/{id}` | Get recycled item details |
| DELETE | `/deletedFiles/{id}` | Permanently delete item |
| DELETE | `/deletedFiles/all` | Clear recycle bin |
| POST | `/deletedFiles/{id}:restore` | Restore recycled item |

## Media - Downloads (4 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/downloads` | List downloaded items |
| GET | `/downloads/{id}` | Get download details by ID |
| PATCH | `/downloads/{id}` | Modify download metadata |
| GET | `/downloads/{id}:download` | Save download by ID |

---

## Events - Events (4 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events` | Retrieve events filtered by type, actor, and time range |
| POST | `/events` | Create a new event for the selected actor |
| GET | `/events/{id}` | Retrieve a specific event by ID |
| GET | `/events:listFieldValues` | List available field values for event filtering |

## Events - Event Types (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/eventTypes` | List all available event types |

## Events - Event Metrics (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/eventMetrics` | Retrieve time-series event metric data for an actor and event type |

## Events - Event Subscriptions (4 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/eventSubscriptions` | List event subscriptions for the account |
| POST | `/eventSubscriptions` | Create a new event subscription (SSE or webhook) |
| GET | `/eventSubscriptions/{id}` | Retrieve a specific event subscription |
| DELETE | `/eventSubscriptions/{id}` | Delete an event subscription |

## Events - Alerts (3 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/alerts` | List alerts with filtering and pagination |
| GET | `/alerts/{id}` | Retrieve a specific alert by ID |
| GET | `/alertTypes` | List all available alert types |

## Events - Notifications (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | List notifications with filtering and pagination |
| GET | `/notifications/{id}` | Retrieve a specific notification by ID |

---

## Automations - Event Alert Condition Rules (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/eventAlertConditionRules` | Create a new rule that produces alerts based on event conditions |
| GET | `/eventAlertConditionRules` | List configured event alert condition rules |
| GET | `/eventAlertConditionRules:listFieldValues` | Fetch available field values for alert condition rules |
| GET | `/eventAlertConditionRules/{id}` | Retrieve details of a specific rule |
| PATCH | `/eventAlertConditionRules/{id}` | Update a specific alert condition rule |
| DELETE | `/eventAlertConditionRules/{id}` | Remove a specific alert condition rule |

## Automations - Alert Action Rules (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/alertActionRules` | Register a new alert action rule with the account |
| GET | `/alertActionRules` | List configured alert action rules |
| GET | `/alertActionRules/{actionRuleId}` | Retrieve a single alert action rule |
| PATCH | `/alertActionRules/{actionRuleId}` | Update a single alert action rule |
| DELETE | `/alertActionRules/{actionRuleId}` | Remove an alert action rule |

## Automations - Alert Actions (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/alertActions` | Register a new alert action with the account |
| GET | `/alertActions` | List configured alert actions |
| GET | `/alertActions/{actionId}` | Retrieve a single alert action |
| PATCH | `/alertActions/{actionId}` | Update a single alert action |
| DELETE | `/alertActions/{actionId}` | Remove an alert action |

---

## Video Search - Video Analytic Events (7 endpoints)

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

## Vehicle Surveillance - LPR Events (4 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lprEvents` | Fetch license plate recognition events with filtering |
| GET | `/lprEvents/{id}` | Retrieve a specific LPR event by ID |
| GET | `/lprEvents:summary` | Obtain aggregated counts of LPR events across time periods |
| GET | `/lprEvents:listFieldValues` | List all possible filter values for LPR event attributes |

## Vehicle Surveillance - LPR Alert Condition Rules (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/lprAlertConditionRules` | Create a new rule for generating alerts based on LPR conditions |
| GET | `/lprAlertConditionRules` | Fetch LPR alert condition rules based on a filter |
| GET | `/lprAlertConditionRules:listFieldValues` | Return possible values across all rule attributes |
| GET | `/lprAlertConditionRules/{id}` | Retrieve details of a specific LPR rule |
| PATCH | `/lprAlertConditionRules/{id}` | Update specified properties of an existing LPR rule |

---

## User & Accounts - Users (9 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | Retrieve a list of users within the account |
| POST | `/users` | Create a new user (verification email sent, pending state) |
| GET | `/users/{userId}` | Retrieve information about a specific user |
| DELETE | `/users/{userId}` | Delete a user and remove all related references |
| PATCH | `/users/{userId}` | Update a user's data |
| GET | `/users/self` | Retrieve information about the current authenticated user |
| PATCH | `/users/self` | Update current user's profile data |
| GET | `/users/self/trustedClients` | Retrieve a list of trusted clients |
| DELETE | `/users/self/trustedClients/{trustedClientId}` | Delete a trusted client device |

## User & Accounts - Accounts (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts` | Retrieve a list of accounts the user has access to |
| DELETE | `/accounts/{id}/credentials/{credentialId}` | Remove a credential from the account |

## User & Accounts - Roles (8 endpoints)

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

## User & Accounts - Audit Log (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auditLogs` | Filter audit events by userId, targetId, type, and timestamp range |

## User & Accounts - Resource Grants (3 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/resourceGrants` | Retrieve a list of resource grants |
| POST | `/resourceGrants:bulkCreate` | Create multiple resource grants in one request |
| POST | `/resourceGrants:bulkDelete` | Delete multiple resource grants in one request |

## User & Accounts - Editions (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/editions` | Retrieve available editions for the account |
| GET | `/editions/{id}` | Retrieve a specific edition by ID |

---

## Resellers - Authorization Tokens (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/authorizationTokens` | Resellers retrieve access tokens for end-user accounts |

---

## Account Settings - SSO (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts/self/ssoAuthSettings` | Get Single Sign On Authentication Settings |
| PATCH | `/accounts/self/ssoAuthSettings` | Update Single Sign On Authentication Settings |

## Account Settings - Client Settings (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clientSettings` | Retrieve settings required to let the client use the API |

---

## System - Applications (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications` | Retrieve all applications accessible by the requesting user |
| POST | `/applications` | Create new application under user's account |
| GET | `/applications/{applicationId}` | Retrieve a single application |
| PATCH | `/applications/{applicationId}` | Update a single application |
| DELETE | `/applications/{applicationId}` | Delete a single application |

## System - OAuth Clients (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications/{applicationId}/oauthClients` | Retrieve all OAuth credentials for the given application |
| POST | `/applications/{applicationId}/oauthClients` | Create OAuth client for application |
| GET | `/applications/{applicationId}/oauthClients/{clientId}` | Retrieve a specific OAuth client |
| PATCH | `/applications/{applicationId}/oauthClients/{clientId}` | Update a specific OAuth client |
| DELETE | `/applications/{applicationId}/oauthClients/{clientId}` | Delete a specific OAuth client |

## System - Reference Data (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/languages` | Retrieve a list of languages supported by the service |
| GET | `/timeZones` | Retrieve a list of the supported time zones |

---

## Summary

| Category | Subcategory | Endpoints |
|----------|-------------|-----------|
| Devices | Cameras | 15 |
| Devices | Bridges | 11 |
| Devices | PTZ | 4 |
| Devices | Speakers | 7 |
| Devices | Device I/O | 6 |
| Devices | Switches | 5 |
| Devices | Multi Cameras | 6 |
| Devices | Available Devices | 1 |
| Grouping | Layouts | 5 |
| Grouping | Tags | 1 |
| Grouping | Locations | 6 |
| Grouping | Floors | 6 |
| Grouping | Floor Plans | 3 |
| Media | Media | 5 |
| Media | Feeds | 1 |
| Media | Exports | 2 |
| Media | Jobs | 3 |
| Media | Files | 11 |
| Media | Downloads | 4 |
| Events | Events | 4 |
| Events | Event Types | 1 |
| Events | Event Metrics | 1 |
| Events | Event Subscriptions | 4 |
| Events | Alerts | 3 |
| Events | Notifications | 2 |
| Automations | Event Alert Condition Rules | 6 |
| Automations | Alert Action Rules | 5 |
| Automations | Alert Actions | 5 |
| Video Search | Video Analytic Events | 7 |
| Vehicle Surveillance | LPR Events | 4 |
| Vehicle Surveillance | LPR Alert Condition Rules | 5 |
| User & Accounts | Users | 9 |
| User & Accounts | Accounts | 2 |
| User & Accounts | Roles | 8 |
| User & Accounts | Audit Log | 1 |
| User & Accounts | Resource Grants | 3 |
| User & Accounts | Editions | 2 |
| Resellers | Authorization Tokens | 1 |
| Account Settings | SSO | 2 |
| Account Settings | Client Settings | 1 |
| System | Applications | 5 |
| System | OAuth Clients | 5 |
| System | Reference Data | 2 |
| **TOTAL** | | **190** |

### By HTTP Method

| Method | Count |
|--------|-------|
| GET | 99 |
| POST | 37 |
| PATCH | 29 |
| DELETE | 23 |
| PUT | 2 |
| **TOTAL** | **190** |
