// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  testDir: './src',
  testMatch: /.*\.test\.ts/,

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['monocart-reporter', {  
        name: "JMH Report Visualizer",
        outputFile: './playwright-report/report.html',
        coverage: {
          outputDir: './playwright-report/coverage',
          lcov: true,
          reports: ['v8', 'console-summary', 'json-summary'],
          entryFilter: (entry) => {
              return (entry.url.includes('localhost') || entry.url.includes('src/')) && 
                     !entry.url.includes('node_modules') &&
                     !entry.url.includes('test-utils') &&
                     !entry.url.includes('.test.');
          },
          sourceFilter: (sourcePath) => {
              return sourcePath.includes('src/') && 
                     !sourcePath.includes('node_modules') &&
                     !sourcePath.includes('test-utils') &&
                     !sourcePath.includes('.test.');
          },
        },
        onEnd: async () => {
        }
    }]
  ],

  use: {
    baseURL: 'http://localhost:1234',

    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:1234',
    reuseExistingServer: !process.env.CI,
  },
});
