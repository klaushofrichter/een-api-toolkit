import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env files: parent first, then local with override to replace any conflicts
// In CI, env vars are passed directly via workflow
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '.env'), override: true })

const redirectUri = process.env.VITE_REDIRECT_URI || 'http://127.0.0.1:3333'
if (!redirectUri.startsWith('http://127.0.0.1:') && !redirectUri.startsWith('http://localhost:')) {
  throw new Error('VITE_REDIRECT_URI must use localhost or 127.0.0.1 for security')
}
export const baseURL = redirectUri

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false, // Run tests sequentially for predictable order
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries - fail fast
  maxFailures: 1, // Stop on first failure
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  timeout: 60000, // Longer timeout for SSE operations
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
