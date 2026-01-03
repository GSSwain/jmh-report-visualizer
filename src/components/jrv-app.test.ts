/* istanbul ignore file */
import { test, expect } from '../test-utils.js';
import { EVENTS } from '../events.js';

test.describe('JrvApp', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render main layout', async ({ page }) => {
    const app = page.locator('jrv-app');
    await expect(app).toBeVisible();
    
    const header = app.locator('jrv-header');
    await expect(header).toBeAttached();
    
    const layout = app.locator('jrv-app-layout');
    await expect(layout).toBeAttached();
    
    const mainContent = app.locator('jrv-main-content');
    await expect(mainContent).toBeAttached();
  });

  test('should show main content after file upload', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
      ),
    });

    const mainContentDiv = page.locator('jrv-main-content').locator('#mainContent');
    await expect(mainContentDiv).not.toHaveClass(/hidden/);
  });

  test('should show results table when toggled', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
      ),
    });

    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
    await settingsButton.click();
    const resultsTableToggle = page.locator('jrv-settings-sidebar').locator('#showResultsTableToggle');
    await resultsTableToggle.check();
    
    const resultsTable = page.locator('jrv-results-data-table');
    await expect(resultsTable).not.toHaveClass(/hidden/);
  });

  test('should re-render charts on benchmark selection change', async ({ page }) => {
      const uploadSidebar = page.locator('jrv-upload-sidebar');
      const fileInput = uploadSidebar.locator('#fileInput');
      await fileInput.setInputFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(
          '[{"benchmark": "b1", "primaryMetric": {"score": 1}, "mode": "avgt"}, {"benchmark": "b2", "primaryMetric": {"score": 2}, "mode": "avgt"}]'
        ),
      });

      const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
      await settingsButton.click();
      const benchmarkCheckbox = page.locator('jrv-settings-sidebar').locator('input[value="b2"]');
      await benchmarkCheckbox.uncheck();

      const chart = page.locator('jrv-benchmark-analysis-card');
      await expect(chart).toBeVisible();
  });

  test('should re-render charts on FQCN toggle', async ({ page }) => {
      const uploadSidebar = page.locator('jrv-upload-sidebar');
      const fileInput = uploadSidebar.locator('#fileInput');
      await fileInput.setInputFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(
          '[{"benchmark": "com.example.b1", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
        ),
      });

      const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
      await settingsButton.click();
      const classNameToggle = page.locator('jrv-settings-sidebar').locator('#showClassNameToggle');
      await classNameToggle.check();

      const chart = page.locator('jrv-benchmark-analysis-card');
      await expect(chart).toBeVisible();
  });
});
