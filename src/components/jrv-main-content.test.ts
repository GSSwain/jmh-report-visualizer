/* istanbul ignore file */
import { test, expect } from '../test-utils.js';

test.describe('JrvMainContent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify([
            {"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt", "params": {"p1": "v1", "p2": "a"}},
            {"benchmark": "test", "primaryMetric": {"score": 2}, "mode": "avgt", "params": {"p1": "v2", "p2": "a"}},
            {"benchmark": "test", "primaryMetric": {"score": 3}, "mode": "avgt", "params": {"p1": "v1", "p2": "b"}}
        ])
      ),
    });
    
    await expect(page.locator('jrv-main-content > div').first()).toBeVisible();
  });

  test('should dispatch jrv:filters:changed event', async ({ page }) => {
    const mainContent = page.locator('jrv-main-content');
    const parameterFilters = mainContent.locator('jrv-parameter-filters');
    
    await expect(parameterFilters).toBeVisible();
    
    const select = parameterFilters.locator('select').first();
    
    const eventPromise = page.evaluate(() => new Promise<void>(resolve => {
        window.addEventListener('jrv:filters:changed', () => resolve(), { once: true });
    }));
    
    await select.selectOption(['v1']);
    
    await eventPromise;
  });

  test('should preserve chart state on re-render', async ({ page }) => {
    const mainContent = page.locator('jrv-main-content');
    
    const chartGroup = mainContent.locator('jrv-benchmark-analysis-card').first();
    const chartTypeSelect = chartGroup.locator('#chartType');
    await chartTypeSelect.selectOption('line');
    
    const parameterFilters = mainContent.locator('jrv-parameter-filters');
    const select = parameterFilters.locator('select').first();
    await select.selectOption(['v1']);
    
    const newChartGroup = mainContent.locator('jrv-benchmark-analysis-card').first();
    const newChartTypeSelect = newChartGroup.locator('#chartType');
    await expect(newChartTypeSelect).toHaveValue('line');
  });

  test('should toggle results table', async ({ page }) => {
    const mainContent = page.locator('jrv-main-content');
    const resultsTable = mainContent.locator('jrv-results-data-table');
    
    await expect(resultsTable).toBeHidden();
    
    await mainContent.evaluate((el: any) => el.toggleResultsTable(true));
    await expect(resultsTable).toBeVisible();
    
    await mainContent.evaluate((el: any) => el.toggleResultsTable(false));
    await expect(resultsTable).toBeHidden();
  });
});
