# AI Prompts for een-api-toolkit

This document contains example prompts that developers can use with AI coding assistants (Claude, ChatGPT, Copilot, etc.) to generate applications using the een-api-toolkit.

## How to Use These Prompts

1. Copy the prompt text
2. Paste it into your AI coding assistant
3. The AI will generate a complete application based on the prompt
4. Customize the generated code as needed

> **Tip:** For best results, ensure the AI has access to the [AI-CONTEXT.md](./AI-CONTEXT.md) file, which contains comprehensive API documentation optimized for AI assistants. This file is also included in the npm package at `node_modules/een-api-toolkit/docs/AI-CONTEXT.md`.

---

## User Management App

**Description:** A Vue 3 application that authenticates with the EEN Video Platform and displays a paginated list of users with detail views.

**Prompt:**

```
We are building a Vue 3 web app that accesses the EEN Video Platform by using the een-api-toolkit (npm install een-api-toolkit@latest). The app allows login to the service and lists all users. This should include pagination for accounts with more than 10 users. When clicking on a user, we want to see details for that user in a modal window. Show a logout button.

Refer to https://github.com/klaushofrichter/een-api-toolkit/blob/production/docs/AI-CONTEXT.md for more information about the een-api-toolkit.

Here are configuration details:
VITE_EEN_CLIENT_ID="YOUR-CLIENT_ID"
VITE_PROXY_URL=http://127.0.0.1:8787
```

**Expected Features:**
- OAuth login flow with EEN Identity Provider
- User list with pagination (10 users per page)
- Click-to-view user details in modal
- Loading states and error handling
- Logout functionality

---

## Camera Dashboard App

**Description:** A Vue 3 application that displays cameras from the EEN Video Platform with filtering and detail views.

**Prompt:**

```
We are building a Vue 3 web app that accesses the EEN Video Platform by using the een-api-toolkit (npm install een-api-toolkit@latest). The app allows login to the service and displays a dashboard of all cameras. Include the following features:

1. List all cameras with their name and status
2. Filter cameras by status (online, offline, all)
3. Pagination for accounts with more than 12 cameras
4. Click on a camera to see detailed information including device info, location, and tags
5. A refresh button to reload the camera list
6. Show a logout button

Refer to https://github.com/klaushofrichter/een-api-toolkit/blob/production/docs/AI-CONTEXT.md for more information about the een-api-toolkit.

Here are configuration details:
VITE_EEN_CLIENT_ID="YOUR-CLIENT_ID"
VITE_PROXY_URL=http://127.0.0.1:8787
```

**Expected Features:**
- OAuth login flow
- Camera grid/list view with status indicators
- Status filter dropdown
- Pagination controls
- Camera detail modal with deviceInfo, shareDetails, tags
- Refresh functionality

---

## Live Video Viewer App

**Description:** A Vue 3 application that displays cameras in a 3x3 grid with live preview images and a modal for live main video streaming.

**Prompt:**

```
We are building a Vue 3 web app that accesses the EEN Video Platform by using the een-api-toolkit (npm install een-api-toolkit@latest). The app allows login to the service and lists up to 9 cameras for that user in a 3x3 grid with a live preview image on each camera card. Include the following features:

1. Display cameras in a 3x3 grid layout (9 cameras per page)
2. Each camera card shows a live preview image that auto-refreshes
3. Pagination when there are more than 9 cameras available
4. When clicking on a camera card, show a modal window with a live main HD video feed from that camera
5. Loading states and error handling
6. Show a logout button

Refer to https://github.com/klaushofrichter/een-api-toolkit/blob/production/docs/AI-CONTEXT.md for more information about the een-api-toolkit.

The node_modules for een-api-toolkit includes examples, including the main video player implementation here: ./node_modules/een-api-toolkit/examples/vue-feeds/src/views/Feeds.vue

Here are configuration details:
VITE_EEN_CLIENT_ID="YOUR-CLIENT_ID"
VITE_PROXY_URL=http://127.0.0.1:8787
```

**Expected Features:**
- OAuth login flow with EEN Identity Provider
- 3x3 camera grid with live preview images
- Auto-refreshing preview thumbnails
- Pagination for accounts with more than 9 cameras
- Click-to-view live main video in modal
- Video player with proper media session handling
- Loading states and error handling
- Logout functionality

---

## Tips for Writing Custom Prompts

When writing your own prompts for AI assistants, include:

1. **Framework/Library:** Specify Vue 3 and een-api-toolkit
2. **Installation:** Include `npm install een-api-toolkit@latest`
3. **AI Context Reference:** Link to the AI-CONTEXT.md file
4. **Configuration:** Provide the environment variables
5. **Features:** List specific features you want
6. **Data Requirements:** Specify which API data to display

### Configuration Template

Always include these configuration details (replace with your actual values):

```
VITE_EEN_CLIENT_ID="YOUR-CLIENT_ID"
VITE_PROXY_URL=http://127.0.0.1:8787
```

### Important Notes

- The app must run on `http://127.0.0.1:3333` (not `localhost`) for OAuth to work
- OAuth callbacks must be handled on the root path `/`
- The OAuth proxy must be running before testing the app
- See [USER-GUIDE.md](./USER-GUIDE.md) for detailed setup instructions

### Logout Implementation

When implementing a logout button, use the `revokeToken()` function from een-api-toolkit:

```typescript
import { revokeToken } from 'een-api-toolkit'
import { useRouter } from 'vue-router'

const router = useRouter()

async function handleLogout() {
  const { error } = await revokeToken()
  if (error) {
    console.error('Logout failed:', error.message)
  }
  // Always redirect to login, even if revoke fails
  router.push('/login')
}
```

The `revokeToken()` function:
- Revokes the session with the OAuth proxy
- Clears the local authentication state
- Returns `{ data, error }` like all toolkit functions

---

## Contributing Prompts

Have a useful prompt? Consider contributing it to this document by submitting a pull request.
