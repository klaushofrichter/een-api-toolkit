# een-api-toolkit - Missing EEN API Endpoints

> Generated: 2026-02-17
> Coverage: 51 of 211 endpoints implemented (24.2%)

This document lists EEN API v3.0 endpoints that are **not yet implemented** by the `een-api-toolkit` library.

---

## DEVICES - Cameras (12 of 15 missing)

Implemented: GET list, GET by ID, GET settings

| Method | Path | Description |
|--------|------|-------------|
| POST | `/cameras` | Add a camera |
| POST | `/cameras:bulkUpdate` | Bulk update cameras |
| PATCH | `/cameras/{cameraId}` | Update a camera |
| DELETE | `/cameras/{cameraId}` | Delete a camera |
| PUT | `/cameras/{cameraId}/tunnel` | Create/update camera tunnel |
| DELETE | `/cameras/{cameraId}/tunnel` | Delete camera tunnel |
| GET | `/cameras/{cameraId}/metrics` | Get camera metrics |
| PATCH | `/cameras/{cameraId}:swap` | Swap a camera |
| GET | `/cameras/{cameraId}/io/ports` | List camera I/O ports |
| GET | `/cameras/{cameraId}/io/ports/{portId}` | Get camera I/O port |
| PATCH | `/cameras/{cameraId}/io/ports/{portId}` | Update camera I/O port |
| PATCH | `/cameras/{cameraId}/settings` | Update camera settings |

## DEVICES - Bridges (9 of 11 missing)

Implemented: GET list, GET by ID

| Method | Path | Description |
|--------|------|-------------|
| POST | `/bridges` | Create a bridge |
| POST | `/bridges:bulkUpdate` | Bulk update bridges |
| PATCH | `/bridges/{bridgeId}` | Update a bridge |
| DELETE | `/bridges/{bridgeId}` | Delete a bridge |
| GET | `/bridges/{bridgeId}/metrics` | Get bridge metrics |
| PATCH | `/bridges/{bridgeId}:swap` | Swap a bridge |
| POST | `/bridges/{bridgeId}/actions` | Trigger bridge action |
| GET | `/bridges/{id}/settings` | Get bridge settings |
| PATCH | `/bridges/{id}/settings` | Update bridge settings |

## DEVICES - PTZ (4 of 4 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cameras/{cameraId}/ptz/position` | Get current PTZ position |
| PUT | `/cameras/{cameraId}/ptz/position` | Move PTZ to position |
| GET | `/cameras/{cameraId}/ptz/settings` | Get PTZ settings |
| PATCH | `/cameras/{cameraId}/ptz/settings` | Update PTZ settings |

## DEVICES - Speakers (7 of 7 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/speakers` | List speakers |
| POST | `/speakers` | Add a speaker |
| GET | `/speakers/{speakerId}` | Get speaker by ID |
| PATCH | `/speakers/{speakerId}` | Update a speaker |
| DELETE | `/speakers/{speakerId}` | Delete a speaker |
| GET | `/speakers/{speakerId}/settings` | Get speaker settings |
| PATCH | `/speakers/{speakerId}/settings` | Update speaker settings |

## DEVICES - Device I/O (6 of 6 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/devices/{deviceId}/io/ports` | List device I/O ports |
| GET | `/devices/{deviceId}/io/ports/{portId}` | Get device I/O port |
| PATCH | `/devices/{deviceId}/io/ports/{portId}` | Update device I/O port |
| GET | `/devices/{deviceId}/io/ports/{portId}/recordingActions` | List port recording actions |
| GET | `/devices/{deviceId}/io/ports/{portId}/recordingActions/{cameraId}` | Get port recording action |
| PATCH | `/devices/{deviceId}/io/ports/{portId}/recordingActions/{cameraId}` | Update port recording action |

## DEVICES - Switches (5 of 5 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/switches` | List switches |
| GET | `/switches/{switchId}` | Get switch by ID |
| PATCH | `/switches/{switchId}` | Update a switch |
| POST | `/switches/{switchId}/ports/{portId}/actions` | Trigger switch port action |
| POST | `/switches/{switchId}/ports/all/actions` | Trigger action on all switch ports |

## DEVICES - Multi Cameras (6 of 6 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/multiCameras` | List multi-cameras |
| POST | `/multiCameras` | Add a multi-camera |
| GET | `/multiCameras/{multiCameraId}` | Get multi-camera by ID |
| PATCH | `/multiCameras/{multiCameraId}` | Update a multi-camera |
| DELETE | `/multiCameras/{multiCameraId}` | Delete a multi-camera |
| GET | `/multiCameras/{multiCameraId}/channels` | Get multi-camera channels |

## DEVICES - Available Devices (1 of 1 missing)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/availableDevices` | List available (unclaimed) devices |

## GROUPING - Tags (1 of 1 missing)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tags` | List tags |

## GROUPING - Locations (6 of 6 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations` | List locations |
| POST | `/locations` | Create a location |
| GET | `/locations/{id}` | Get location by ID |
| PATCH | `/locations/{id}` | Update a location |
| DELETE | `/locations/{id}` | Delete a location |
| GET | `/locations/{id}/locations` | Get location descendants |

## GROUPING - Floors (6 of 6 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}/floors` | List floors for a location |
| POST | `/locations/{locationId}/floors` | Create a floor |
| GET | `/locations/{locationId}/floors/{id}` | Get floor by ID |
| PATCH | `/locations/{locationId}/floors/{id}` | Update a floor |
| DELETE | `/locations/{locationId}/floors/{id}` | Delete a floor |
| GET | `/locations/{locationId}/floors/{id}.{type}` | Get floor image |

## GROUPING - Floor Plans (3 of 3 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}/floors/{id}/plans` | List floor plans |
| POST | `/locations/{locationId}/floors/{id}/plans` | Set a floor plan |
| DELETE | `/locations/{locationId}/floors/{id}/plans/{planId}` | Delete a floor plan |

## MEDIA - Media (1 of 5 missing)

Implemented: GET list, GET liveImage, GET recordedImage, GET session

| Method | Path | Description |
|--------|------|-------------|
| GET | `/media/recordedImage.jpeg:listFieldValues` | List recorded image overlay field values |

## MEDIA - Exports (1 of 2 missing)

Implemented: POST create

| Method | Path | Description |
|--------|------|-------------|
| POST | `/exports/{jobId}:copy` | Retry/copy an export |

## MEDIA - Files (6 of 11 missing)

Implemented: GET list, GET by ID, POST add, GET download, DELETE

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/files/{id}` | Update a file |
| GET | `/deletedFiles` | List trash (deleted files) |
| GET | `/deletedFiles/{id}` | Get deleted file |
| DELETE | `/deletedFiles/{id}` | Permanently delete a trash file |
| DELETE | `/deletedFiles/all` | Permanently delete all trash files |
| POST | `/deletedFiles/{id}:restore` | Restore a deleted file |

## MEDIA - Downloads (1 of 4 missing)

Implemented: GET list, GET by ID, GET download

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/downloads/{id}` | Update a download |

## EVENTS - Events (2 of 5 missing)

Implemented: GET list, GET by ID, GET listFieldValues

| Method | Path | Description |
|--------|------|-------------|
| POST | `/events` | Create an event |
| GET | `/events:listRecentByType` | List recent events by type |

## EVENTS - Event Subscriptions (4 of 8 missing)

Implemented: GET list, GET by ID, POST create, DELETE

| Method | Path | Description |
|--------|------|-------------|
| GET | `/eventSubscriptions/{id}/filters` | List subscription filters |
| POST | `/eventSubscriptions/{id}/filters` | Create subscription filter |
| GET | `/eventSubscriptions/{id}/filters/{filterId}` | Get subscription filter |
| DELETE | `/eventSubscriptions/{id}/filters/{filterId}` | Delete subscription filter |

## EVENTS - Notifications (1 of 3 missing)

Implemented: GET list, GET by ID

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/notifications/{id}` | Update a notification |

## AUTOMATIONS - Event Alert Condition Rules (3 of 6 missing)

Implemented: GET list, GET listFieldValues, GET by ID

| Method | Path | Description |
|--------|------|-------------|
| POST | `/eventAlertConditionRules` | Create event alert condition rule |
| PATCH | `/eventAlertConditionRules/{id}` | Update event alert condition rule |
| DELETE | `/eventAlertConditionRules/{id}` | Delete event alert condition rule |

## AUTOMATIONS - Alert Action Rules (3 of 5 missing)

Implemented: GET list, GET by ID

| Method | Path | Description |
|--------|------|-------------|
| POST | `/alertActionRules` | Create alert action rule |
| PATCH | `/alertActionRules/{actionRuleId}` | Update alert action rule |
| DELETE | `/alertActionRules/{actionRuleId}` | Delete alert action rule |

## AUTOMATIONS - Alert Actions (3 of 5 missing)

Implemented: GET list, GET by ID

| Method | Path | Description |
|--------|------|-------------|
| POST | `/alertActions` | Create alert action |
| PATCH | `/alertActions/{actionId}` | Update alert action |
| DELETE | `/alertActions/{actionId}` | Delete alert action |

## VIDEO SEARCH - Video Analytic Events (7 of 7 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/videoAnalyticEvents:parse` | Parse video analytics query |
| POST | `/videoAnalyticEvents:deepSearch` | Deep search video analytics events |
| POST | `/videoAnalyticEvents:deepSearchGroupByResource` | Deep search grouped by resource |
| POST | `/videoAnalyticEvents:deepSearchGroupByTime` | Deep search grouped by time |
| POST | `/videoAnalyticEvents:listFieldValues` | List video analytics field values |
| GET | `/videoAnalyticEvents:listObjectValues` | List video analytics object values |
| GET | `/videoAnalyticEvents/{id}` | Get video analytics event by ID |

## VEHICLE SURVEILLANCE - LPR Events (4 of 4 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lprEvents` | List LPR events |
| GET | `/lprEvents/{id}` | Get LPR event by ID |
| GET | `/lprEvents:summary` | Get LPR events summary |
| GET | `/lprEvents:listFieldValues` | List LPR event field values |

## VEHICLE SURVEILLANCE - LPR Alert Condition Rules (6 of 6 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lprAlertConditionRules` | List LPR alert condition rules |
| POST | `/lprAlertConditionRules` | Create LPR alert condition rule |
| GET | `/lprAlertConditionRules:listFieldValues` | List LPR rule field values |
| GET | `/lprAlertConditionRules/{id}` | Get LPR alert condition rule |
| PATCH | `/lprAlertConditionRules/{id}` | Update LPR alert condition rule |
| DELETE | `/lprAlertConditionRules/{id}` | Delete LPR alert condition rule |

## VEHICLE SURVEILLANCE - LPR Vehicle Lists (14 of 14 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lprVehicleLists` | List vehicle lists |
| POST | `/lprVehicleLists` | Create vehicle list |
| GET | `/lprVehicleLists:listFields` | List vehicle list fields |
| GET | `/lprVehicleLists:listFieldValues` | List vehicle list field values |
| GET | `/lprVehicleLists/{id}` | Get vehicle list by ID |
| PATCH | `/lprVehicleLists/{id}` | Update vehicle list |
| DELETE | `/lprVehicleLists/{id}` | Delete vehicle list |
| GET | `/lprVehicleLists/{id}/vehicles` | List vehicles in a list |
| POST | `/lprVehicleLists/{id}/vehicles` | Add vehicle to list |
| POST | `/lprVehicleLists/{id}/vehicles:bulkCreate` | Bulk add vehicles |
| GET | `/lprVehicleLists/{id}/vehicles/{recordId}` | Get vehicle by ID |
| PATCH | `/lprVehicleLists/{id}/vehicles/{recordId}` | Update a vehicle |
| DELETE | `/lprVehicleLists/{id}/vehicles/{recordId}` | Delete a vehicle |
| GET | `/lprVehicleLists:search` | Search vehicle lists |

## USER & ACCOUNTS - Users (6 of 9 missing)

Implemented: GET list, GET by ID, GET self

| Method | Path | Description |
|--------|------|-------------|
| POST | `/users` | Create a user |
| PATCH | `/users/{userId}` | Update a user |
| DELETE | `/users/{userId}` | Delete a user |
| PATCH | `/users/self` | Update current user |
| GET | `/users/self/trustedClients` | List trusted OAuth clients |
| DELETE | `/users/self/trustedClients/{trustedClientId}` | Delete trusted client |

## USER & ACCOUNTS - Accounts (2 of 2 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts` | List accounts |
| DELETE | `/accounts/{id}/credentials/{credentialId}` | Delete account credential |

## USER & ACCOUNTS - Roles (8 of 8 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/roles` | List roles |
| POST | `/roles` | Create a role |
| GET | `/roles/{roleId}` | Get role by ID |
| PATCH | `/roles/{roleId}` | Update a role |
| DELETE | `/roles/{roleId}` | Delete a role |
| GET | `/roleAssignments` | List role assignments |
| POST | `/roleAssignments:bulkcreate` | Bulk create role assignments |
| POST | `/roleAssignments:bulkdelete` | Bulk delete role assignments |

## USER & ACCOUNTS - Audit Log (1 of 1 missing)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auditLogs` | List audit logs |

## USER & ACCOUNTS - Resource Grants (3 of 3 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/resourceGrants` | List resource grants |
| POST | `/resourceGrants:bulkCreate` | Bulk create resource grants |
| POST | `/resourceGrants:bulkDelete` | Bulk delete resource grants |

## USER & ACCOUNTS - Editions (2 of 2 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/editions` | List editions |
| GET | `/editions/{id}` | Get edition by ID |

## RESELLERS - Authorization Tokens (1 of 1 missing)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/authorizationTokens` | Create authorization token |

## ACCOUNT SETTINGS - SSO (2 of 2 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts/self/ssoAuthSettings` | Get SSO auth settings |
| PATCH | `/accounts/self/ssoAuthSettings` | Update SSO auth settings |

## ACCOUNT SETTINGS - Client Settings (1 of 1 missing)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clientSettings` | Get client settings |

## SYSTEM - Applications (5 of 5 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications` | List applications |
| POST | `/applications` | Create an application |
| GET | `/applications/{applicationId}` | Get application by ID |
| PATCH | `/applications/{applicationId}` | Update an application |
| DELETE | `/applications/{applicationId}` | Delete an application |

## SYSTEM - OAuth Clients (5 of 5 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications/{applicationId}/oauthClients` | List OAuth clients |
| POST | `/applications/{applicationId}/oauthClients` | Create OAuth client |
| GET | `/applications/{applicationId}/oauthClients/{clientId}` | Get OAuth client |
| PATCH | `/applications/{applicationId}/oauthClients/{clientId}` | Update OAuth client |
| DELETE | `/applications/{applicationId}/oauthClients/{clientId}` | Delete OAuth client |

## SYSTEM - Reference Data (2 of 2 missing - entire section)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/languages` | List supported languages |
| GET | `/timeZones` | List supported time zones |

---

## Summary

| Status | Count |
|--------|-------|
| Implemented | 51 |
| Missing | 160 |
| **Total EEN API endpoints** | **211** |
| **Coverage** | **24.2%** |

### Missing by Category

| Category | Missing | Total | Coverage |
|----------|---------|-------|----------|
| Cameras | 12 | 15 | 20% |
| Bridges | 9 | 11 | 18% |
| PTZ | 4 | 4 | 0% |
| Speakers | 7 | 7 | 0% |
| Device I/O | 6 | 6 | 0% |
| Switches | 5 | 5 | 0% |
| Multi Cameras | 6 | 6 | 0% |
| Available Devices | 1 | 1 | 0% |
| Layouts | 0 | 5 | 100% |
| Tags | 1 | 1 | 0% |
| Locations | 6 | 6 | 0% |
| Floors | 6 | 6 | 0% |
| Floor Plans | 3 | 3 | 0% |
| Media | 1 | 5 | 80% |
| Feeds | 0 | 1 | 100% |
| Exports | 1 | 2 | 50% |
| Jobs | 0 | 3 | 100% |
| Files | 6 | 11 | 45% |
| Downloads | 1 | 4 | 75% |
| Events | 2 | 5 | 60% |
| Event Types | 0 | 1 | 100% |
| Event Metrics | 0 | 1 | 100% |
| Event Subscriptions | 4 | 8 | 50% |
| Alerts | 0 | 3 | 100% |
| Notifications | 1 | 3 | 67% |
| Event Alert Condition Rules | 3 | 6 | 50% |
| Alert Action Rules | 3 | 5 | 40% |
| Alert Actions | 3 | 5 | 40% |
| Video Analytic Events | 7 | 7 | 0% |
| LPR Events | 4 | 4 | 0% |
| LPR Alert Condition Rules | 6 | 6 | 0% |
| LPR Vehicle Lists | 14 | 14 | 0% |
| Users | 6 | 9 | 33% |
| Accounts | 2 | 2 | 0% |
| Roles | 8 | 8 | 0% |
| Audit Log | 1 | 1 | 0% |
| Resource Grants | 3 | 3 | 0% |
| Editions | 2 | 2 | 0% |
| Authorization Tokens | 1 | 1 | 0% |
| SSO | 2 | 2 | 0% |
| Client Settings | 1 | 1 | 0% |
| Applications | 5 | 5 | 0% |
| OAuth Clients | 5 | 5 | 0% |
| Reference Data | 2 | 2 | 0% |

### Fully Implemented Sections

- Layouts (5/5)
- Feeds (1/1)
- Jobs (3/3)
- Event Types (1/1)
- Event Metrics (1/1)
- Alerts (3/3)

### Entirely Missing Sections (0% coverage)

- PTZ, Speakers, Device I/O, Switches, Multi Cameras, Available Devices
- Tags, Locations, Floors, Floor Plans
- Video Analytic Events, LPR Events, LPR Alert Condition Rules, LPR Vehicle Lists
- Accounts, Roles, Audit Log, Resource Grants, Editions
- Authorization Tokens, SSO, Client Settings
- Applications, OAuth Clients, Reference Data
