# een-api-toolkit - Implemented EEN API Endpoints

> Generated: 2026-02-17
> Toolkit version: see `package.json`

This document lists all EEN API v3.0 endpoints implemented by the `een-api-toolkit` library.

---

## Authentication (via OAuth Proxy)

These functions communicate with the OAuth proxy server, not the EEN API directly.

| Function | Proxy Endpoint | Source |
|----------|---------------|--------|
| `getAccessToken(code)` | POST `/proxy/getAccessToken` | `src/auth/service.ts` |
| `refreshToken()` | POST `/proxy/refreshAccessToken` | `src/auth/service.ts` |
| `revokeToken()` | POST `/proxy/revokeAccessToken` | `src/auth/service.ts` |
| `handleAuthCallback(code, state)` | (uses getAccessToken) | `src/auth/service.ts` |

## Users (3 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/users/self` | `getCurrentUser()` | `src/users/service.ts` |
| GET | `/api/v3.0/users` | `getUsers(params?)` | `src/users/service.ts` |
| GET | `/api/v3.0/users/{userId}` | `getUser(userId, params?)` | `src/users/service.ts` |

## Cameras (3 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/cameras` | `getCameras(params?)` | `src/cameras/service.ts` |
| GET | `/api/v3.0/cameras/{cameraId}` | `getCamera(cameraId, params?)` | `src/cameras/service.ts` |
| GET | `/api/v3.0/cameras/{cameraId}/settings` | `getCameraSettings(cameraId, params?)` | `src/cameras/service.ts` |

## Bridges (2 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/bridges` | `getBridges(params?)` | `src/bridges/service.ts` |
| GET | `/api/v3.0/bridges/{bridgeId}` | `getBridge(bridgeId, params?)` | `src/bridges/service.ts` |

## Layouts (5 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/layouts` | `getLayouts(params?)` | `src/layouts/service.ts` |
| GET | `/api/v3.0/layouts/{layoutId}` | `getLayout(layoutId, params?)` | `src/layouts/service.ts` |
| POST | `/api/v3.0/layouts` | `createLayout(params)` | `src/layouts/service.ts` |
| PATCH | `/api/v3.0/layouts/{layoutId}` | `updateLayout(layoutId, params)` | `src/layouts/service.ts` |
| DELETE | `/api/v3.0/layouts/{layoutId}` | `deleteLayout(layoutId)` | `src/layouts/service.ts` |

## Media (4 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/media` | `listMedia(params)` | `src/media/service.ts` |
| GET | `/api/v3.0/media/liveImage.jpeg` | `getLiveImage(params)` | `src/media/service.ts` |
| GET | `/api/v3.0/media/recordedImage.jpeg` | `getRecordedImage(params)` | `src/media/service.ts` |
| GET | `/api/v3.0/media/session` | `getMediaSession()` | `src/media/service.ts` |

Note: `initMediaSession()` is a higher-level wrapper around `getMediaSession()`.

## Feeds (1 endpoint)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/feeds` | `listFeeds(params?)` | `src/feeds/service.ts` |

## Events (3 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/events` | `listEvents(params)` | `src/events/service.ts` |
| GET | `/api/v3.0/events/{eventId}` | `getEvent(eventId, params?)` | `src/events/service.ts` |
| GET | `/api/v3.0/events:listFieldValues` | `listEventFieldValues(params)` | `src/events/service.ts` |

## Event Types (1 endpoint)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/eventTypes` | `listEventTypes(params?)` | `src/events/service.ts` |

## Event Metrics (1 endpoint)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/eventMetrics` | `getEventMetrics(params)` | `src/eventMetrics/service.ts` |

## Alerts (3 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/alerts` | `listAlerts(params?)` | `src/alerts/service.ts` |
| GET | `/api/v3.0/alerts/{alertId}` | `getAlert(alertId, params?)` | `src/alerts/service.ts` |
| GET | `/api/v3.0/alertTypes` | `listAlertTypes(params?)` | `src/alerts/service.ts` |

## Notifications (2 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/notifications` | `listNotifications(params?)` | `src/notifications/service.ts` |
| GET | `/api/v3.0/notifications/{notificationId}` | `getNotification(notificationId)` | `src/notifications/service.ts` |

## Event Subscriptions (4 endpoints + SSE)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/eventSubscriptions` | `listEventSubscriptions(params?)` | `src/eventSubscriptions/service.ts` |
| GET | `/api/v3.0/eventSubscriptions/{id}` | `getEventSubscription(id)` | `src/eventSubscriptions/service.ts` |
| POST | `/api/v3.0/eventSubscriptions` | `createEventSubscription(params)` | `src/eventSubscriptions/service.ts` |
| DELETE | `/api/v3.0/eventSubscriptions/{id}` | `deleteEventSubscription(id)` | `src/eventSubscriptions/service.ts` |
| SSE | (SSE URL from subscription) | `connectToEventSubscription(url, options)` | `src/eventSubscriptions/service.ts` |

## Automations - Event Alert Condition Rules (3 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/eventAlertConditionRules` | `listEventAlertConditionRules(params?)` | `src/automations/service.ts` |
| GET | `/api/v3.0/eventAlertConditionRules:listFieldValues` | `getEventAlertConditionRuleFieldValues(params?)` | `src/automations/service.ts` |
| GET | `/api/v3.0/eventAlertConditionRules/{ruleId}` | `getEventAlertConditionRule(ruleId)` | `src/automations/service.ts` |

## Automations - Alert Condition Rules (2 endpoints)

> Note: These endpoints (`/alertConditionRules`) are not listed in the official EEN OpenAPI specifications or developer portal. They may be internal or deprecated endpoints.

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/alertConditionRules` | `listAlertConditionRules(params?)` | `src/automations/service.ts` |
| GET | `/api/v3.0/alertConditionRules/{ruleId}` | `getAlertConditionRule(ruleId, params?)` | `src/automations/service.ts` |

## Automations - Alert Action Rules (2 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/alertActionRules` | `listAlertActionRules(params?)` | `src/automations/service.ts` |
| GET | `/api/v3.0/alertActionRules/{ruleId}` | `getAlertActionRule(ruleId)` | `src/automations/service.ts` |

## Automations - Alert Actions (2 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/alertActions` | `listAlertActions(params?)` | `src/automations/service.ts` |
| GET | `/api/v3.0/alertActions/{actionId}` | `getAlertAction(actionId)` | `src/automations/service.ts` |

## Exports (1 endpoint)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| POST | `/api/v3.0/exports` | `createExportJob(params)` | `src/exports/service.ts` |

## Jobs (3 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/jobs` | `listJobs(params?)` | `src/jobs/service.ts` |
| GET | `/api/v3.0/jobs/{jobId}` | `getJob(jobId, params?)` | `src/jobs/service.ts` |
| DELETE | `/api/v3.0/jobs/{jobId}` | `deleteJob(jobId)` | `src/jobs/service.ts` |

## Files (5 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/files` | `listFiles(params?)` | `src/files/service.ts` |
| GET | `/api/v3.0/files/{fileId}` | `getFile(fileId, params?)` | `src/files/service.ts` |
| POST | `/api/v3.0/files` | `addFile(params)` | `src/files/service.ts` |
| GET | `/api/v3.0/files/{fileId}:download` | `downloadFile(fileId)` | `src/files/service.ts` |
| DELETE | `/api/v3.0/files/{fileId}` | `deleteFile(fileId)` | `src/files/service.ts` |

## Downloads (3 endpoints)

| Method | EEN API Path | Toolkit Function | Source |
|--------|-------------|-----------------|--------|
| GET | `/api/v3.0/downloads` | `listDownloads(params?)` | `src/downloads/service.ts` |
| GET | `/api/v3.0/downloads/{downloadId}` | `getDownload(downloadId, params?)` | `src/downloads/service.ts` |
| GET | `/api/v3.0/downloads/{downloadId}:download` | `downloadDownload(downloadId)` | `src/downloads/service.ts` |

---

## Summary

| Category | Implemented Endpoints |
|----------|----------------------|
| Users | 3 |
| Cameras | 3 |
| Bridges | 2 |
| Layouts | 5 |
| Media | 4 |
| Feeds | 1 |
| Events | 3 |
| Event Types | 1 |
| Event Metrics | 1 |
| Alerts | 3 |
| Notifications | 2 |
| Event Subscriptions | 4 (+SSE) |
| Event Alert Condition Rules | 3 |
| Alert Condition Rules | 2 (undocumented) |
| Alert Action Rules | 2 |
| Alert Actions | 2 |
| Exports | 1 |
| Jobs | 3 |
| Files | 5 |
| Downloads | 3 |
| **Total (official EEN API)** | **51** |
| Auth (proxy, not EEN API) | 4 |
| SSE connection | 1 |
| Alert Condition Rules (undocumented) | 2 |

### By HTTP Method

| Method | Count |
|--------|-------|
| GET | 42 |
| POST | 4 |
| PATCH | 1 |
| DELETE | 4 |
| **Total** | **51** |
