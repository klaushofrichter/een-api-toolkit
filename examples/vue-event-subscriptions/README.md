# Event Subscriptions Example

This example demonstrates how to use the Event Subscriptions API from the EEN API Toolkit to create SSE subscriptions and receive real-time events from cameras.

## Features

- Create and delete event subscriptions with SSE delivery
- View active subscriptions with pagination
- Select cameras and event types for filtering
- Connect to SSE streams for live events
- Real-time event display with auto-scrolling

## Prerequisites

1. Node.js 20 LTS or later
2. EEN OAuth credentials (client ID and secret)
3. Running OAuth proxy server (from `../een-oauth-proxy`)

## Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration:
   - `VITE_PROXY_URL`: URL of your OAuth proxy server
   - `VITE_EEN_CLIENT_ID`: Your EEN OAuth client ID
   - `VITE_REDIRECT_URI`: OAuth redirect URI (default: http://127.0.0.1:3333)
   - `VITE_DEBUG`: Enable debug logging (optional)

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the OAuth proxy (in a separate terminal):
   ```bash
   cd ../een-oauth-proxy
   npm run dev
   ```

5. Start the example app:
   ```bash
   npm run dev
   ```

6. Open http://127.0.0.1:3333 in your browser

## Usage

### Creating a Subscription

1. Log in with your Eagle Eye Networks account
2. Go to "Subscriptions" page
3. Select one or more cameras from the dropdown
4. Select one or more event types
5. Click "Create Subscription"

### Viewing Live Events

1. Go to "Live Events" page
2. Select a subscription from the dropdown
3. Click "Connect"
4. Events will appear in real-time as they occur
5. Click "Disconnect" to stop receiving events

## API Functions Used

- `listEventSubscriptions()` - List all subscriptions
- `getEventSubscription(id)` - Get a specific subscription
- `createEventSubscription(params)` - Create a new subscription
- `deleteEventSubscription(id)` - Delete a subscription
- `connectToEventSubscription(sseUrl, options)` - Connect to SSE stream
- `getCameras()` - List cameras for filter selection
- `listEventTypes()` - List event types for filter selection

## Event Subscription Lifecycle

SSE subscriptions are **temporary** by default:
- Automatically created with a time-to-live (TTL)
- Deleted when no client is connected after TTL expires
- Can be manually deleted at any time

## Troubleshooting

### No events appearing

- Ensure the camera has activity (motion, etc.)
- Check that the subscription has the correct event types
- Verify the SSE connection status shows "connected"

### Connection errors

- Verify the OAuth proxy is running
- Check that your token is valid (re-login if needed)
- Ensure the subscription still exists (may have expired)

### Cannot create subscription

- Ensure you have cameras in your account
- Check that event types are loaded
- Verify your account has permission to create subscriptions
