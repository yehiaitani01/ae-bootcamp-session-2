const { defineConfig, devices } = require('@playwright/test');

const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const BACKEND_PORT = process.env.PORT || 3030;

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start:backend',
      url: `http://localhost:${BACKEND_PORT}/`,
      reuseExistingServer: !process.env.CI,
      env: { PORT: String(BACKEND_PORT), DB_PATH: ':memory:' },
    },
    {
      command: 'npm run start:frontend',
      url: `http://localhost:${FRONTEND_PORT}`,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: String(FRONTEND_PORT),
        BACKEND_PORT: String(BACKEND_PORT),
        BROWSER: 'none',
      },
    },
  ],
});
