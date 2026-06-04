// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  reporter: 'list',
  use: {
    baseURL: 'file://' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/'),
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
