import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env files: parent .env first, then local .env overrides parent values
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true })

const redirectUri = process.env.VITE_REDIRECT_URI || 'http://127.0.0.1:3333'
if (!redirectUri.startsWith('http://127.0.0.1:') && !redirectUri.startsWith('http://localhost:')) {
  throw new Error('VITE_REDIRECT_URI must use localhost or 127.0.0.1 for security')
}
const baseURL = redirectUri

// Export for use in test files
export { baseURL }

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  maxFailures: 1,
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
