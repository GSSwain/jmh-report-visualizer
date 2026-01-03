/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvResultsDataTable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should be hidden by default', async ({ page }) => {
    const resultsDataTable = page.locator('jrv-results-data-table');
    await expect(resultsDataTable).toBeHidden();
  });

  test('should become visible when toggled in settings', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    const status = uploadSidebar.locator('#uploadStatus');

    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test", "primaryMetric": {"score": 1, "scoreUnit": "ns/op"}, "mode": "avgt"}]'
      ),
    });
    
    await expect(status).toHaveText(/valid JMH report\(s\) loaded/);

    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
    await settingsButton.click();
    
    const sidebar = page.locator('jrv-settings-sidebar');
    await expect(sidebar).not.toHaveClass(/collapsed/);
    
    const resultsTableToggle = sidebar.locator('#showResultsTableToggle');
    await expect(resultsTableToggle).toBeVisible();
    await resultsTableToggle.check();

    const resultsDataTable = page.locator('jrv-results-data-table');
    await expect(resultsDataTable).toBeVisible();
    await expect(resultsDataTable.locator('.table-container')).toBeVisible();
  });

  test('should display correct headers and data for varying params', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    const status = uploadSidebar.locator('#uploadStatus');

    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify([
            {"benchmark": "b1", "primaryMetric": {"score": 1, "scoreUnit": "ns/op"}, "mode": "avgt", "params": {"p1": "v1"}},
            {"benchmark": "b2", "primaryMetric": {"score": 2, "scoreUnit": "ns/op"}, "mode": "avgt", "params": {"p1": "v2"}}
        ])
      ),
    });
    
    await expect(status).toHaveText(/valid JMH report\(s\) loaded/);
    
    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
    await settingsButton.click();
    
    const sidebar = page.locator('jrv-settings-sidebar');
    await expect(sidebar).not.toHaveClass(/collapsed/);

    const resultsTableToggle = sidebar.locator('#showResultsTableToggle');
    await expect(resultsTableToggle).toBeVisible();
    await resultsTableToggle.check();

    const resultsDataTable = page.locator('jrv-results-data-table');
    await expect(resultsDataTable).toBeVisible();

    const headers = resultsDataTable.locator('th');
    await expect(headers).toHaveCount(5);
    await expect(headers.nth(1)).toHaveText('p1');
  });

  test('should move common parameters out of the table', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    const status = uploadSidebar.locator('#uploadStatus');

    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify([
            {"benchmark": "b1", "primaryMetric": {"score": 1, "scoreUnit": "ns/op"}, "mode": "avgt", "params": {"common": "c", "p1": "v1"}},
            {"benchmark": "b2", "primaryMetric": {"score": 2, "scoreUnit": "ns/op"}, "mode": "avgt", "params": {"common": "c", "p1": "v2"}}
        ])
      ),
    });

    await expect(status).toHaveText(/valid JMH report\(s\) loaded/);

    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
    await settingsButton.click();
    
    const sidebar = page.locator('jrv-settings-sidebar');
    await expect(sidebar).not.toHaveClass(/collapsed/);

    const resultsTableToggle = sidebar.locator('#showResultsTableToggle');
    await expect(resultsTableToggle).toBeVisible();
    await resultsTableToggle.check();

    const resultsDataTable = page.locator('jrv-results-data-table');
    await expect(resultsDataTable).toBeVisible();

    const headers = resultsDataTable.locator('th');
    await expect(headers).toHaveCount(5);
    
    const commonParams = resultsDataTable.locator('#commonParameters');
    await expect(commonParams).toContainText('common: c');
  });
});
