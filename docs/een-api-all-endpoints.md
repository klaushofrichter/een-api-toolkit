# Eagle Eye Networks REST API v3.0 - Complete Endpoint Reference

> Generated: 2026-02-17
> Source: [EEN Developer Portal](https://developer.eagleeyenetworks.com/reference/using-the-api) and [OpenAPI Specifications](https://github.com/EENCloud/VMS-Developer-Portal/tree/main/Open%20API%20Specifications)

All paths are prefixed with `/api/v3.0` on the appropriate base URL (e.g., `https://c001.eagleeyenetworks.com`).

---

## DEVICES - Cameras (15 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cameras` | List cameras |
| POST | `/cameras` | Add a camera |
| POST | `/cameras:bulkUpdate` | Bulk update cameras |
| GET | `/cameras/{cameraId}` | Get camera by ID |
| PATCH | `/cameras/{cameraId}` | Update a camera |
| DELETE | `/cameras/{cameraId}` | Delete a camera |
| PUT | `/cameras/{cameraId}/tunnel` | Create/update camera tunnel |
| DELETE | `/cameras/{cameraId}/tunnel` | Delete camera tunnel |
| GET | `/cameras/{cameraId}/metrics` | Get camera metrics |
| PATCH | `/cameras/{cameraId}:swap` | Swap a camera |
| GET | `/cameras/{cameraId}/io/ports` | List camera I/O ports |
| GET | `/cameras/{cameraId}/io/ports/{portId}` | Get camera I/O port |
| PATCH | `/cameras/{cameraId}/io/ports/{portId}` | Update camera I/O port |
| GET | `/cameras/{cameraId}/settings` | Get camera settings |
| PATCH | `/cameras/{cameraId}/settings` | Update camera settings |

## DEVICES - Bridges (11 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/bridges` | List bridges |
| POST | `/bridges` | Create a bridge |
| POST | `/bridges:bulkUpdate` | Bulk update bridges |
| GET | `/bridges/{bridgeId}` | Get bridge by ID |
| PATCH | `/bridges/{bridgeId}` | Update a bridge |
| DELETE | `/bridges/{bridgeId}` | Delete a bridge |
| GET | `/bridges/{bridgeId}/metrics` | Get bridge metrics |
| PATCH | `/bridges/{bridgeId}:swap` | Swap a bridge |
| POST | `/bridges/{bridgeId}/actions` | Trigger bridge action |
| GET | `/bridges/{id}/settings` | Get bridge settings |
| PATCH | `/bridges/{id}/settings` | Update bridge settings |

## DEVICES - PTZ (4 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/cameras/{cameraId}/ptz/position` | Get current PTZ position |
| PUT | `/cameras/{cameraId}/ptz/position` | Move PTZ to position |
| GET | `/cameras/{cameraId}/ptz/settings` | Get PTZ settings |
| PATCH | `/cameras/{cameraId}/ptz/settings` | Update PTZ settings |

## DEVICES - Speakers (7 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/speakers` | List speakers |
| POST | `/speakers` | Add a speaker |
| GET | `/speakers/{speakerId}` | Get speaker by ID |
| PATCH | `/speakers/{speakerId}` | Update a speaker |
| DELETE | `/speakers/{speakerId}` | Delete a speaker |
| GET | `/speakers/{speakerId}/settings` | Get speaker settings |
| PATCH | `/speakers/{speakerId}/settings` | Update speaker settings |

## DEVICES - Device I/O (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/devices/{deviceId}/io/ports` | List device I/O ports |
| GET | `/devices/{deviceId}/io/ports/{portId}` | Get device I/O port |
| PATCH | `/devices/{deviceId}/io/ports/{portId}` | Update device I/O port |
| GET | `/devices/{deviceId}/io/ports/{portId}/recordingActions` | List port recording actions |
| GET | `/devices/{deviceId}/io/ports/{portId}/recordingActions/{cameraId}` | Get port recording action |
| PATCH | `/devices/{deviceId}/io/ports/{portId}/recordingActions/{cameraId}` | Update port recording action |

## DEVICES - Switches (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/switches` | List switches |
| GET | `/switches/{switchId}` | Get switch by ID |
| PATCH | `/switches/{switchId}` | Update a switch |
| POST | `/switches/{switchId}/ports/{portId}/actions` | Trigger switch port action |
| POST | `/switches/{switchId}/ports/all/actions` | Trigger action on all switch ports |

## DEVICES - Multi Cameras (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/multiCameras` | List multi-cameras |
| POST | `/multiCameras` | Add a multi-camera |
| GET | `/multiCameras/{multiCameraId}` | Get multi-camera by ID |
| PATCH | `/multiCameras/{multiCameraId}` | Update a multi-camera |
| DELETE | `/multiCameras/{multiCameraId}` | Delete a multi-camera |
| GET | `/multiCameras/{multiCameraId}/channels` | Get multi-camera channels |

## DEVICES - Available Devices (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/availableDevices` | List available (unclaimed) devices |

## GROUPING - Layouts (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/layouts` | List layouts |
| POST | `/layouts` | Create a layout |
| GET | `/layouts/{layoutId}` | Get layout by ID |
| PATCH | `/layouts/{layoutId}` | Update a layout |
| DELETE | `/layouts/{layoutId}` | Delete a layout |

## GROUPING - Tags (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tags` | List tags |

## GROUPING - Locations (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations` | List locations |
| POST | `/locations` | Create a location |
| GET | `/locations/{id}` | Get location by ID |
| PATCH | `/locations/{id}` | Update a location |
| DELETE | `/locations/{id}` | Delete a location |
| GET | `/locations/{id}/locations` | Get location descendants |

## GROUPING - Floors (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}/floors` | List floors for a location |
| POST | `/locations/{locationId}/floors` | Create a floor |
| GET | `/locations/{locationId}/floors/{id}` | Get floor by ID |
| PATCH | `/locations/{locationId}/floors/{id}` | Update a floor |
| DELETE | `/locations/{locationId}/floors/{id}` | Delete a floor |
| GET | `/locations/{locationId}/floors/{id}.{type}` | Get floor image |

## GROUPING - Floor Plans (3 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/locations/{locationId}/floors/{id}/plans` | List floor plans |
| POST | `/locations/{locationId}/floors/{id}/plans` | Set a floor plan |
| DELETE | `/locations/{locationId}/floors/{id}/plans/{planId}` | Delete a floor plan |

## MEDIA - Media (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/media` | List media (recording spans) |
| GET | `/media/recordedImage.jpeg` | Get recorded image |
| GET | `/media/recordedImage.jpeg:listFieldValues` | List recorded image overlay field values |
| GET | `/media/liveImage.jpeg` | Get live image |
| GET | `/media/session` | Get media session URL |

## MEDIA - Feeds (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/feeds` | List feeds (live video streams) |

## MEDIA - Exports (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/exports` | Create an export job |
| POST | `/exports/{jobId}:copy` | Retry/copy an export |

## MEDIA - Jobs (3 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/jobs` | List jobs |
| GET | `/jobs/{jobId}` | Get job by ID |
| DELETE | `/jobs/{jobId}` | Delete a job |

## MEDIA - Files (11 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/files` | List files |
| POST | `/files` | Add a file |
| GET | `/files/{id}` | Get file by ID |
| PATCH | `/files/{id}` | Update a file |
| DELETE | `/files/{id}` | Delete a file |
| GET | `/files/{id}:download` | Download a file |
| GET | `/deletedFiles` | List trash (deleted files) |
| GET | `/deletedFiles/{id}` | Get deleted file |
| DELETE | `/deletedFiles/{id}` | Permanently delete a trash file |
| DELETE | `/deletedFiles/all` | Permanently delete all trash files |
| POST | `/deletedFiles/{id}:restore` | Restore a deleted file |

## MEDIA - Downloads (4 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/downloads` | List downloads |
| GET | `/downloads/{id}` | Get download by ID |
| PATCH | `/downloads/{id}` | Update a download |
| GET | `/downloads/{id}:download` | Download a download file |

## EVENTS - Events (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/events` | List events |
| POST | `/events` | Create an event |
| GET | `/events/{id}` | Get event by ID |
| GET | `/events:listRecentByType` | List recent events by type |
| GET | `/events:listFieldValues` | List event field values |

## EVENTS - Event Types (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/eventTypes` | List event types |

## EVENTS - Event Metrics (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/eventMetrics` | Get event metrics |

## EVENTS - Event Subscriptions (8 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/eventSubscriptions` | List event subscriptions |
| POST | `/eventSubscriptions` | Create event subscription |
| GET | `/eventSubscriptions/{id}` | Get event subscription |
| DELETE | `/eventSubscriptions/{id}` | Delete event subscription |
| GET | `/eventSubscriptions/{id}/filters` | List subscription filters |
| POST | `/eventSubscriptions/{id}/filters` | Create subscription filter |
| GET | `/eventSubscriptions/{id}/filters/{filterId}` | Get subscription filter |
| DELETE | `/eventSubscriptions/{id}/filters/{filterId}` | Delete subscription filter |

## EVENTS - Alerts (3 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/alerts` | List alerts |
| GET | `/alerts/{id}` | Get alert by ID |
| GET | `/alertTypes` | List alert types |

## EVENTS - Notifications (3 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | List notifications |
| GET | `/notifications/{id}` | Get notification by ID |
| PATCH | `/notifications/{id}` | Update a notification |

## AUTOMATIONS - Event Alert Condition Rules (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/eventAlertConditionRules` | List event alert condition rules |
| POST | `/eventAlertConditionRules` | Create event alert condition rule |
| GET | `/eventAlertConditionRules:listFieldValues` | List rule field values |
| GET | `/eventAlertConditionRules/{id}` | Get event alert condition rule |
| PATCH | `/eventAlertConditionRules/{id}` | Update event alert condition rule |
| DELETE | `/eventAlertConditionRules/{id}` | Delete event alert condition rule |

## AUTOMATIONS - Alert Action Rules (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/alertActionRules` | List alert action rules |
| POST | `/alertActionRules` | Create alert action rule |
| GET | `/alertActionRules/{actionRuleId}` | Get alert action rule |
| PATCH | `/alertActionRules/{actionRuleId}` | Update alert action rule |
| DELETE | `/alertActionRules/{actionRuleId}` | Delete alert action rule |

## AUTOMATIONS - Alert Actions (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/alertActions` | List alert actions |
| POST | `/alertActions` | Create alert action |
| GET | `/alertActions/{actionId}` | Get alert action |
| PATCH | `/alertActions/{actionId}` | Update alert action |
| DELETE | `/alertActions/{actionId}` | Delete alert action |

## VIDEO SEARCH - Video Analytic Events (7 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/videoAnalyticEvents:parse` | Parse video analytics query |
| POST | `/videoAnalyticEvents:deepSearch` | Deep search video analytics events |
| POST | `/videoAnalyticEvents:deepSearchGroupByResource` | Deep search grouped by resource |
| POST | `/videoAnalyticEvents:deepSearchGroupByTime` | Deep search grouped by time |
| POST | `/videoAnalyticEvents:listFieldValues` | List video analytics field values |
| GET | `/videoAnalyticEvents:listObjectValues` | List video analytics object values |
| GET | `/videoAnalyticEvents/{id}` | Get video analytics event by ID |

## VEHICLE SURVEILLANCE - LPR Events (4 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lprEvents` | List LPR events |
| GET | `/lprEvents/{id}` | Get LPR event by ID |
| GET | `/lprEvents:summary` | Get LPR events summary |
| GET | `/lprEvents:listFieldValues` | List LPR event field values |

## VEHICLE SURVEILLANCE - LPR Alert Condition Rules (6 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/lprAlertConditionRules` | List LPR alert condition rules |
| POST | `/lprAlertConditionRules` | Create LPR alert condition rule |
| GET | `/lprAlertConditionRules:listFieldValues` | List LPR rule field values |
| GET | `/lprAlertConditionRules/{id}` | Get LPR alert condition rule |
| PATCH | `/lprAlertConditionRules/{id}` | Update LPR alert condition rule |
| DELETE | `/lprAlertConditionRules/{id}` | Delete LPR alert condition rule |

## VEHICLE SURVEILLANCE - LPR Vehicle Lists (14 endpoints)

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

## USER & ACCOUNTS - Users (9 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List users |
| POST | `/users` | Create a user |
| GET | `/users/{userId}` | Get user by ID |
| PATCH | `/users/{userId}` | Update a user |
| DELETE | `/users/{userId}` | Delete a user |
| GET | `/users/self` | Get current user |
| PATCH | `/users/self` | Update current user |
| GET | `/users/self/trustedClients` | List trusted OAuth clients |
| DELETE | `/users/self/trustedClients/{trustedClientId}` | Delete trusted client |

## USER & ACCOUNTS - Accounts (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts` | List accounts |
| DELETE | `/accounts/{id}/credentials/{credentialId}` | Delete account credential |

## USER & ACCOUNTS - Roles (8 endpoints)

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

## USER & ACCOUNTS - Audit Log (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auditLogs` | List audit logs |

## USER & ACCOUNTS - Resource Grants (3 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/resourceGrants` | List resource grants |
| POST | `/resourceGrants:bulkCreate` | Bulk create resource grants |
| POST | `/resourceGrants:bulkDelete` | Bulk delete resource grants |

## USER & ACCOUNTS - Editions (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/editions` | List editions |
| GET | `/editions/{id}` | Get edition by ID |

## RESELLERS - Authorization Tokens (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/authorizationTokens` | Create authorization token (reseller account switching) |

## ACCOUNT SETTINGS - SSO (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts/self/ssoAuthSettings` | Get SSO auth settings |
| PATCH | `/accounts/self/ssoAuthSettings` | Update SSO auth settings |

## ACCOUNT SETTINGS - Client Settings (1 endpoint)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/clientSettings` | Get client settings |

## SYSTEM - Applications (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications` | List applications |
| POST | `/applications` | Create an application |
| GET | `/applications/{applicationId}` | Get application by ID |
| PATCH | `/applications/{applicationId}` | Update an application |
| DELETE | `/applications/{applicationId}` | Delete an application |

## SYSTEM - OAuth Clients (5 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/applications/{applicationId}/oauthClients` | List OAuth clients |
| POST | `/applications/{applicationId}/oauthClients` | Create OAuth client |
| GET | `/applications/{applicationId}/oauthClients/{clientId}` | Get OAuth client |
| PATCH | `/applications/{applicationId}/oauthClients/{clientId}` | Update OAuth client |
| DELETE | `/applications/{applicationId}/oauthClients/{clientId}` | Delete OAuth client |

## SYSTEM - Reference Data (2 endpoints)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/languages` | List supported languages |
| GET | `/timeZones` | List supported time zones |

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
| Events | Events | 5 |
| Events | Event Types | 1 |
| Events | Event Metrics | 1 |
| Events | Event Subscriptions | 8 |
| Events | Alerts | 3 |
| Events | Notifications | 3 |
| Automations | Event Alert Condition Rules | 6 |
| Automations | Alert Action Rules | 5 |
| Automations | Alert Actions | 5 |
| Video Search | Video Analytic Events | 7 |
| Vehicle Surveillance | LPR Events | 4 |
| Vehicle Surveillance | LPR Alert Condition Rules | 6 |
| Vehicle Surveillance | LPR Vehicle Lists | 14 |
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
| **TOTAL** | | **211** |

### By HTTP Method

| Method | Count |
|--------|-------|
| GET | 117 |
| POST | 35 |
| PATCH | 30 |
| DELETE | 27 |
| PUT | 2 |
| **Total** | **211** |
