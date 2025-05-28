// src/config/timeouts.ts
import EnvironmentDetector from '../environmentDetector';

const isCI = EnvironmentDetector.isRunningInCI();

export const TIMEOUTS = {
  // Test framework timeouts
  test: isCI ? 30_000 : 15_000,
  expect: isCI ? 45_000 : 30_000,

  // UI timeouts
  ui: {
    action: isCI ? 140_000 : 70_000,
    navigation: isCI ? 30_000 : 15_000,
  },

  // API timeouts
  api: {
    standard: isCI ? 30_000 : 15_000, // Standard API calls
    upload: isCI ? 120_000 : 60_000, // File uploads
    download: isCI ? 180_000 : 90_000, // File downloads
    healthCheck: isCI ? 5_000 : 3_000, // Health checks
    connection: isCI ? 15_000 : 8_000, // Connection establishment
    longRunning: isCI ? 120_000 : 60_000, // Long operations
  },

  // Database timeouts
  db: {
    query: isCI ? 30_000 : 15_000, // Standard queries
    transaction: isCI ? 60_000 : 30_000, // Transactions
    migration: isCI ? 180_000 : 90_000, // Migrations
    connection: isCI ? 10_000 : 5_000, // DB connection
  },
};

// Usage examples:
// In tests: TIMEOUTS.test, TIMEOUTS.expect
// In UI code: TIMEOUTS.ui.action, TIMEOUTS.ui.navigation
// In API code: TIMEOUTS.api.standard, TIMEOUTS.api.upload
// In DB code: TIMEOUTS.db.query, TIMEOUTS.db.transaction
