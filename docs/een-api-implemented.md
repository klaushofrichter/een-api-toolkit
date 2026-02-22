# een-api-toolkit - Implemented EEN API Endpoints

> Generated: 2026-02-21
> Toolkit version: see `package.json`

REST endpoint coverage: **55 of 190 EEN API endpoints implemented (28.9%)**

Note on auth proxy functions: these communicate with the OAuth proxy server, not the EEN API directly, and are not counted in the EEN API coverage totals.

Note on SSE: `connectToEventSubscription()` uses Server-Sent Events over a fetch stream, not a REST endpoint. It is listed separately and not counted in REST coverage totals.

---

## Authentication (via OAuth Proxy)

These functions call the OAuth proxy server (`VITE_PROXY_URL`), not the EEN API. They are NOT counted in EEN API coverage.

| Proxy Endpoint | Toolkit Function | Source |
|----------------|-----------------|--------|
| `POST /proxy/getAccessToken` | `getAccessToken()` | `src/auth/service.ts` |
| `POST /proxy/refreshAccessToken` | `refreshToken()` | `src/auth/service.ts` |
| `POST /proxy/revoke` | `revokeToken()` | `src/auth/service.ts` |
| (orchestrates OAuth callback) | `handleAuthCallback()` | `src/auth/service.ts` |

---

## Devices - PTZ (4 of 4 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/cameras/{cameraId}/ptz/position` | `getPtzPosition()` | `src/ptz/service.ts` |
| PUT | `/api/v3.0/cameras/{cameraId}/ptz/position` | `movePtz()` | `src/ptz/service.ts` |
| GET | `/api/v3.0/cameras/{cameraId}/ptz/settings` | `getPtzSettings()` | `src/ptz/service.ts` |
| PATCH | `/api/v3.0/cameras/{cameraId}/ptz/settings` | `updatePtzSettings()` | `src/ptz/service.ts` |

## Devices - Cameras (3 of 15 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/cameras` | `getCameras()` | `src/cameras/service.ts` |
| GET | `/api/v3.0/cameras/{cameraId}` | `getCamera()` | `src/cameras/service.ts` |
| GET | `/api/v3.0/cameras/{cameraId}/settings` | `getCameraSettings()` | `src/cameras/service.ts` |

## Devices - Bridges (2 of 11 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/bridges` | `getBridges()` | `src/bridges/service.ts` |
| GET | `/api/v3.0/bridges/{bridgeId}` | `getBridge()` | `src/bridges/service.ts` |

---

## Grouping - Layouts (5 of 5 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/layouts` | `getLayouts()` | `src/layouts/service.ts` |
| POST | `/api/v3.0/layouts` | `createLayout()` | `src/layouts/service.ts` |
| GET | `/api/v3.0/layouts/{layoutId}` | `getLayout()` | `src/layouts/service.ts` |
| PATCH | `/api/v3.0/layouts/{layoutId}` | `updateLayout()` | `src/layouts/service.ts` |
| DELETE | `/api/v3.0/layouts/{layoutId}` | `deleteLayout()` | `src/layouts/service.ts` |

---

## Media - Media (4 of 5 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/media` | `listMedia()` | `src/media/service.ts` |
| GET | `/api/v3.0/media/liveImage.jpeg` | `getLiveImage()` | `src/media/service.ts` |
| GET | `/api/v3.0/media/recordedImage.jpeg` | `getRecordedImage()` | `src/media/service.ts` |
| GET | `/api/v3.0/media/session` | `getMediaSession()` | `src/media/service.ts` |

## Media - Feeds (1 of 1 endpoint)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/feeds` | `listFeeds()` | `src/feeds/service.ts` |

## Media - Exports (1 of 2 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| POST | `/api/v3.0/exports` | `createExportJob()` | `src/exports/service.ts` |

## Media - Jobs (3 of 3 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/jobs` | `listJobs()` | `src/jobs/service.ts` |
| GET | `/api/v3.0/jobs/{jobId}` | `getJob()` | `src/jobs/service.ts` |
| DELETE | `/api/v3.0/jobs/{jobId}` | `deleteJob()` | `src/jobs/service.ts` |

## Media - Files (5 of 11 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/files` | `listFiles()` | `src/files/service.ts` |
| POST | `/api/v3.0/files` | `addFile()` | `src/files/service.ts` |
| GET | `/api/v3.0/files/{id}` | `getFile()` | `src/files/service.ts` |
| GET | `/api/v3.0/files/{id}:download` | `downloadFile()` | `src/files/service.ts` |
| DELETE | `/api/v3.0/files/{id}` | `deleteFile()` | `src/files/service.ts` |

## Media - Downloads (3 of 4 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/downloads` | `listDownloads()` | `src/downloads/service.ts` |
| GET | `/api/v3.0/downloads/{id}` | `getDownload()` | `src/downloads/service.ts` |
| GET | `/api/v3.0/downloads/{id}:download` | `downloadDownload()` | `src/downloads/service.ts` |

---

## Events - Events (3 of 4 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/events` | `listEvents()` | `src/events/service.ts` |
| GET | `/api/v3.0/events/{id}` | `getEvent()` | `src/events/service.ts` |
| GET | `/api/v3.0/events:listFieldValues` | `listEventFieldValues()` | `src/events/service.ts` |

## Events - Event Types (1 of 1 endpoint)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/eventTypes` | `listEventTypes()` | `src/events/service.ts` |

## Events - Event Metrics (1 of 1 endpoint)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/eventMetrics` | `getEventMetrics()` | `src/eventMetrics/service.ts` |

## Events - Event Subscriptions (4 of 4 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/eventSubscriptions` | `listEventSubscriptions()` | `src/eventSubscriptions/service.ts` |
| POST | `/api/v3.0/eventSubscriptions` | `createEventSubscription()` | `src/eventSubscriptions/service.ts` |
| GET | `/api/v3.0/eventSubscriptions/{id}` | `getEventSubscription()` | `src/eventSubscriptions/service.ts` |
| DELETE | `/api/v3.0/eventSubscriptions/{id}` | `deleteEventSubscription()` | `src/eventSubscriptions/service.ts` |

**SSE Connection (not a REST endpoint):**

| Type | Description | Toolkit Function | Source |
|------|-------------|-----------------|--------|
| SSE | Connect to event subscription stream via Server-Sent Events | `connectToEventSubscription()` | `src/eventSubscriptions/service.ts` |

## Events - Alerts (3 of 3 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/alerts` | `listAlerts()` | `src/alerts/service.ts` |
| GET | `/api/v3.0/alerts/{id}` | `getAlert()` | `src/alerts/service.ts` |
| GET | `/api/v3.0/alertTypes` | `listAlertTypes()` | `src/alerts/service.ts` |

## Events - Notifications (2 of 2 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/notifications` | `listNotifications()` | `src/notifications/service.ts` |
| GET | `/api/v3.0/notifications/{id}` | `getNotification()` | `src/notifications/service.ts` |

---

## Automations - Event Alert Condition Rules (3 of 6 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/eventAlertConditionRules` | `listEventAlertConditionRules()` | `src/automations/service.ts` |
| GET | `/api/v3.0/eventAlertConditionRules:listFieldValues` | `getEventAlertConditionRuleFieldValues()` | `src/automations/service.ts` |
| GET | `/api/v3.0/eventAlertConditionRules/{id}` | `getEventAlertConditionRule()` | `src/automations/service.ts` |

> **Note:** The toolkit also implements `GET /api/v3.0/alertConditionRules` (`listAlertConditionRules()`) and `GET /api/v3.0/alertConditionRules/{id}` (`getAlertConditionRule()`). The `/alertConditionRules` path is not present in the official OpenAPI specs — it may be an undocumented or deprecated endpoint variant. Use `/eventAlertConditionRules` for documented behavior.

## Automations - Alert Action Rules (2 of 5 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/alertActionRules` | `listAlertActionRules()` | `src/automations/service.ts` |
| GET | `/api/v3.0/alertActionRules/{actionRuleId}` | `getAlertActionRule()` | `src/automations/service.ts` |

## Automations - Alert Actions (2 of 5 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/alertActions` | `listAlertActions()` | `src/automations/service.ts` |
| GET | `/api/v3.0/alertActions/{actionId}` | `getAlertAction()` | `src/automations/service.ts` |

---

## User & Accounts - Users (3 of 9 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/users/self` | `getCurrentUser()` | `src/users/service.ts` |
| GET | `/api/v3.0/users` | `getUsers()` | `src/users/service.ts` |
| GET | `/api/v3.0/users/{userId}` | `getUser()` | `src/users/service.ts` |

---

## Summary

### Coverage by Category

| Category | Implemented | Total | Coverage |
|----------|-------------|-------|---------|
| Devices - Cameras | 3 | 15 | 20% |
| Devices - Bridges | 2 | 11 | 18% |
| Devices - PTZ | 4 | 4 | 100% |
| Devices - Speakers | 0 | 7 | 0% |
| Devices - Device I/O | 0 | 6 | 0% |
| Devices - Switches | 0 | 5 | 0% |
| Devices - Multi Cameras | 0 | 6 | 0% |
| Devices - Available Devices | 0 | 1 | 0% |
| Grouping - Layouts | 5 | 5 | 100% |
| Grouping - Tags | 0 | 1 | 0% |
| Grouping - Locations | 0 | 6 | 0% |
| Grouping - Floors | 0 | 6 | 0% |
| Grouping - Floor Plans | 0 | 3 | 0% |
| Media - Media | 4 | 5 | 80% |
| Media - Feeds | 1 | 1 | 100% |
| Media - Exports | 1 | 2 | 50% |
| Media - Jobs | 3 | 3 | 100% |
| Media - Files | 5 | 11 | 45% |
| Media - Downloads | 3 | 4 | 75% |
| Events - Events | 3 | 4 | 75% |
| Events - Event Types | 1 | 1 | 100% |
| Events - Event Metrics | 1 | 1 | 100% |
| Events - Event Subscriptions | 4 | 4 | 100% |
| Events - Alerts | 3 | 3 | 100% |
| Events - Notifications | 2 | 2 | 100% |
| Automations - Event Alert Condition Rules | 3 | 6 | 50% |
| Automations - Alert Action Rules | 2 | 5 | 40% |
| Automations - Alert Actions | 2 | 5 | 40% |
| Video Search - Video Analytic Events | 0 | 7 | 0% |
| Vehicle Surveillance - LPR Events | 0 | 4 | 0% |
| Vehicle Surveillance - LPR Alert Condition Rules | 0 | 5 | 0% |
| User & Accounts - Users | 3 | 9 | 33% |
| User & Accounts - Accounts | 0 | 2 | 0% |
| User & Accounts - Roles | 0 | 8 | 0% |
| User & Accounts - Audit Log | 0 | 1 | 0% |
| User & Accounts - Resource Grants | 0 | 3 | 0% |
| User & Accounts - Editions | 0 | 2 | 0% |
| Resellers - Authorization Tokens | 0 | 1 | 0% |
| Account Settings - SSO | 0 | 2 | 0% |
| Account Settings - Client Settings | 0 | 1 | 0% |
| System - Applications | 0 | 5 | 0% |
| System - OAuth Clients | 0 | 5 | 0% |
| System - Reference Data | 0 | 2 | 0% |
| **TOTAL** | **55** | **190** | **28.9%** |

### By HTTP Method

| Method | Implemented | Total in API | Coverage |
|--------|-------------|--------------|---------|
| GET | 42 | 99 | 42.4% |
| POST | 5 | 37 | 13.5% |
| PATCH | 3 | 29 | 10.3% |
| DELETE | 3 | 23 | 13.0% |
| PUT | 1 | 2 | 50.0% |
| **TOTAL** | **54** | **190** | **28.4%** |

> Note: Method totals above differ slightly from the section totals because `connectToEventSubscription()` (SSE, not REST) and the undocumented `alertConditionRules` endpoints are excluded from the method count.
