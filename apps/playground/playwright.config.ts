import { defineConfig } from '@playwright/test';

// E2E against the production build served by vite preview with the GitHub
// Pages base path, mirroring the deployed environment.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:4173/gifloopcoder/',
  },
  webServer: {
    command: 'BASE_PATH=/gifloopcoder/ npm run build && npm run preview -- --base /gifloopcoder/ --port 4173 --strictPort',
    url: 'http://localhost:4173/gifloopcoder/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
        },
      },
    },
  ],
});
