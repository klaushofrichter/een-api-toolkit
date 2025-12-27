import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.VITE_REDIRECT_URI || 'http://127.0.0.1:3333'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  timeout: 30000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  },
  outputDir: './e2e-results/',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
})
