# AI Prompts for een-api-toolkit

This document contains example prompts that developers can use with AI coding assistants (Claude, ChatGPT, Copilot, etc.) to generate applications using the een-api-toolkit.

## How to Use These Prompts

1. Copy the prompt text
2. Paste it into your AI coding assistant
3. The AI will generate a complete application based on the prompt
4. Customize the generated code as needed

> **Tip:** For best results, ensure the AI has access to the [AI-CONTEXT.md](./AI-CONTEXT.md) file, which contains comprehensive API documentation optimized for AI assistants.

---

## User Management App

**Description:** A Vue 3 application that authenticates with the EEN Video Platform and displays a paginated list of users with detail views.

**Prompt:**

```
We are building a Vue 3 web app that accesses the EEN Video Platform by using the een-api-toolkit (npm install een-api-toolkit@latest). The app allows login to the service and lists all users. This should include pagination for accounts with more than 10 users. When clicking on a user, we want to see details for that user in a modal window.

Refer to https://github.com/klaushofrichter/een-api-toolkit/blob/develop/docs/AI-CONTEXT.md for more information about the een-api-toolkit.

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

Refer to https://github.com/klaushofrichter/een-api-toolkit/blob/develop/docs/AI-CONTEXT.md for more information about the een-api-toolkit.

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

---

## Contributing Prompts

Have a useful prompt? Consider contributing it to this document by submitting a pull request.
