const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'newsletter-analytics.spec.js',
  timeout: 45000,
  expect: { timeout: 10000 },
  use: { baseURL: 'http://127.0.0.1:3017', channel: 'chrome', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run start -- --hostname 127.0.0.1 --port 3017',
    url: 'http://127.0.0.1:3017/admin/analytics',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
