import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    // The site is configured with `base: "/portfolio/"` for GitHub Pages, so
    // the dev server serves it from that sub-path too.
    baseURL: 'http://127.0.0.1:4321/portfolio/',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host --port 4321',
    url: 'http://127.0.0.1:4321/portfolio/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
