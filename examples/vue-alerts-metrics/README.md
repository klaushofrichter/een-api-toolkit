# vue-alerts-metrics

A Vue 3 example application demonstrating the Event Metrics, Alerts, and Notifications APIs from the `een-api-toolkit`.

## Status

| Feature | Status |
|---------|--------|
| Event Metrics | Supported |
| Alerts | Work in Progress |
| Notifications | Work in Progress |

> **Note:** The Event Metrics feature is fully functional. Alerts and Notifications UI components are present but the underlying API integration may have limitations.

## Features

- **OAuth Authentication** - Secure login via Eagle Eye Networks
- **Camera Selection** - Browse and select cameras from your account
- **Time Range Selection** - View data for 1h, 6h, 24h, or 7 days
- **Event Metrics Chart** - Line chart visualization of event counts over time
- **Event Type Selection** - Filter metrics by specific event types
- **Alert Type Filtering** - Filter alerts by type (work in progress)
- **Notifications List** - View notifications for selected camera (work in progress)

## Prerequisites

1. **OAuth Proxy** - Running instance of [een-oauth-proxy](https://github.com/klaushofrichter/een-oauth-proxy)
2. **EEN Account** - Valid Eagle Eye Networks account with API access
3. **Node.js** - Version 20 or higher

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (or copy from parent):
   ```bash
   VITE_PROXY_URL=http://127.0.0.1:8787
   VITE_EEN_CLIENT_ID=your-client-id
   VITE_REDIRECT_URI=http://127.0.0.1:3333
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://127.0.0.1:3333 in your browser

## Usage

1. Click **Login** to authenticate with Eagle Eye Networks
2. After login, you'll be redirected to the Dashboard
3. Select a **Camera** from the dropdown
4. Select an **Event Type** to view metrics in the chart
5. Use the **Time Range** buttons to change the data window
6. View Alerts and Notifications in the panels below (work in progress)

## Project Structure

```
vue-alerts-metrics/
├── src/
│   ├── components/
│   │   ├── AlertsList.vue         # Alerts display with type filter
│   │   ├── CameraSelector.vue     # Camera dropdown
│   │   ├── MetricsChart.vue       # Chart.js line chart
│   │   ├── NotificationsList.vue  # Notifications display
│   │   └── TimeRangeSelector.vue  # Time range buttons
│   ├── views/
│   │   ├── Callback.vue           # OAuth callback handler
│   │   ├── Dashboard.vue          # Main dashboard view
│   │   ├── Home.vue               # Landing page
│   │   ├── Login.vue              # Login page
│   │   └── Logout.vue             # Logout handler
│   ├── router/
│   │   └── index.ts               # Vue Router config
│   ├── App.vue                    # Root component
│   └── main.ts                    # App entry point
├── e2e/
│   ├── app.spec.ts                # Basic navigation tests
│   └── auth.spec.ts               # OAuth flow tests
├── playwright.config.ts           # Playwright configuration
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test:e2e` | Run Playwright E2E tests |

## E2E Testing

The example includes Playwright E2E tests that verify:
- Basic navigation and page rendering
- OAuth login flow
- Dashboard functionality
- Camera and event type selection
- Alerts and notifications loading

To run E2E tests:
```bash
# Ensure OAuth proxy is running
npm run test:e2e
```

Required environment variables for E2E tests:
- `TEST_USER` - Test account email
- `TEST_PASSWORD` - Test account password

## API Functions Used

This example demonstrates the following `een-api-toolkit` functions:

- `initEenToolkit()` - Initialize the toolkit
- `getAuthUrl()` - Get OAuth authorization URL
- `handleAuthCallback()` - Handle OAuth callback
- `useAuthStore()` - Access authentication state
- `getCameras()` - List available cameras
- `listEventFieldValues()` - Get available event types for a camera
- `getEventMetrics()` - Fetch event metrics time-series data
- `listAlertTypes()` - Get available alert types
- `listAlerts()` - Fetch alerts for a camera
- `listNotifications()` - Fetch notifications for a camera

## Known Limitations

- **Event Metrics aggregation** - The EEN API requires a minimum 60-minute aggregation period. Shorter time ranges (1h, 6h) will have fewer data points.
- **Alerts API** - Alert type filtering is functional, but some alert types may not have data.
- **Notifications API** - Notification display is implemented but may have limited data depending on account configuration.
