const nextJest = require('next/jest');

// Unit tests only (pure helpers under lib/). The Playwright specs in tests/ need a
// running site and a live API, so they stay on their own script.
const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'node',
  testMatch: ['<rootDir>/lib/**/__tests__/**/*.test.js'],
});
