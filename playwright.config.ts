import { defineConfig, devices } from '@playwright/test';
import { TIMEOUTS } from './src/config/timeouts/timeouts';
import { OrtoniReportConfig } from 'ortoni-report';
import path from 'path';
import EnvironmentDetector from './src/config/environmentDetector';
import BrowserInitFlag from './src/utils/environment/browserInitFlag';

// Detect if running in Continuous Integration environment
const isCI = EnvironmentDetector.isRunningInCI();

// Performance optimization: Skip browser initialization for crypto and database operations
const shouldSkipBrowserInit = BrowserInitFlag.shouldSkipBrowserInit();

const reportConfig: OrtoniReportConfig = {
  open: isCI ? 'never' : 'always',
  folderPath: 'ortoni-report',
  filename: 'index.html',
  logo: path.resolve(process.cwd(), ''),
  title: 'Restful Booker Test Report',
  showProject: false,
  projectName: 'restful-booker-api-automation-v2',
  testType: process.env.TEST_TYPE || 'Regression | Sanity | Weekly',
  authorName: 'Tshifhiwa Sinugo',
  base64Image: false,
  stdIO: false,
  preferredTheme: 'dark',
  meta: {
    project: 'restful-booker-api-automation-v2',
    description:
      'Framework (version 2) for validating Restful Booker API workflows to ensure seamless integration and quality',
    platform: process.env.TEST_PLATFORM || 'Windows',
    environment: process.env.ENV || 'QA',
  },
};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: TIMEOUTS.test,
  expect: {
    timeout: TIMEOUTS.expect,
  },
  testDir: './tests',
  globalSetup: './src/config/environment/global/globalEnvironmentSetup.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? undefined : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI
    ? [
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'results.xml' }],
        ['ortoni-report', reportConfig],
        ['dot'],
        ['playwright-trx-reporter', { outputFile: 'results.trx' }],
      ]
    : [
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'results.xml' }],
        ['ortoni-report', reportConfig],
        ['dot'],
        ['playwright-trx-reporter', { outputFile: 'results.trx' }],
      ],
  grep:
    typeof process.env.PLAYWRIGHT_GREP === 'string'
      ? new RegExp(process.env.PLAYWRIGHT_GREP)
      : process.env.PLAYWRIGHT_GREP || /.*/,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /*
     *Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
     * Maximum time each action such as click() can take. Defaults to 0 (no limit).
     * Maximum time the page can wait for actions such as waitForSelector(). Defaults to 0 (no limit).
     */
    //actionTimeout: TIMEOUTS.ui.action,
    //navigationTimeout: TIMEOUTS.ui.navigation,
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    /*
     * Project configuration with conditional browser setup:
     *
     * 1. When shouldSkipBrowserInit is FALSE (normal mode):
     *    - Additional browser configurations can be included if needed
     *
     * 2. When shouldSkipBrowserInit is TRUE (performance optimization):
     *    - No additional setup projects are included
     *    - This optimization is useful for operations that don't need browser context
     *      like crypto or database-only operations
     */
    ...(!shouldSkipBrowserInit ? [] : []),
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
