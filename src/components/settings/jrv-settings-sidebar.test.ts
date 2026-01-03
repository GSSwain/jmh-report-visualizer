/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';
import { EVENTS } from '../../events.js';

test.describe('JrvSettingsSidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should be collapsed by default', async ({ page }) => {
    const sidebar = page.locator('jrv-settings-sidebar');
    await expect(sidebar).toHaveClass(/collapsed/);
  });

  test('should show no-data message when empty', async ({ page }) => {
    const sidebar = page.locator('jrv-settings-sidebar');
    const noDataMessage = sidebar.locator('#no-data-message');
    await expect(noDataMessage).not.toHaveClass(/hidden/);
    
    const settingsContent = sidebar.locator('#settings-content');
    await expect(settingsContent).toHaveClass(/hidden/);
  });

  test('should show settings content after data load', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
      ),
    });

    const sidebar = page.locator('jrv-settings-sidebar');
    const noDataMessage = sidebar.locator('#no-data-message');
    await expect(noDataMessage).toHaveClass(/hidden/);
    
    const settingsContent = sidebar.locator('#settings-content');
    await expect(settingsContent).not.toHaveClass(/hidden/);
    
    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
    await settingsButton.click();
    await expect(sidebar).not.toHaveClass(/collapsed/);

    const benchmarkCheckbox = sidebar.locator('input[name="benchmark"]');
    await expect(benchmarkCheckbox).toBeVisible();
    await expect(benchmarkCheckbox).toBeChecked();
  });
  
  test('should dispatch events', async ({ page }) => {
      const uploadSidebar = page.locator('jrv-upload-sidebar');
      const fileInput = uploadSidebar.locator('#fileInput');
      await fileInput.setInputFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(
          '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
        ),
      });
      
      const sidebar = page.locator('jrv-settings-sidebar');
      
      const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
      await settingsButton.click();
      await expect(sidebar).not.toHaveClass(/collapsed/);
      
      // 1. Benchmark selection
      await page.evaluate((eventName) => {
          (window as any).benchEvent = false;
          window.addEventListener(eventName, () => { (window as any).benchEvent = true; });
      }, EVENTS.SETTINGS.BENCHMARK_SELECTION_CHANGED);
      const benchmarkCheckbox = sidebar.locator('input[name="benchmark"]').first();
      await benchmarkCheckbox.uncheck();
      await expect.poll(async () => await page.evaluate(() => (window as any).benchEvent)).toBe(true);
      
      // 2. FQCN toggle
      await page.evaluate((eventName) => {
          (window as any).fqcnEvent = null;
          window.addEventListener(eventName, (e: any) => { (window as any).fqcnEvent = e.detail; });
      }, EVENTS.SETTINGS.SHOW_FQCN_CHANGED);
      const fqcnToggle = sidebar.locator('#showClassNameToggle');
      await fqcnToggle.check();
      await expect.poll(async () => await page.evaluate(() => (window as any).fqcnEvent)).toEqual({ showFullyQualifiedClassName: true });
      
      // 3. Results table toggle
      await page.evaluate((eventName) => {
          (window as any).tableEvent = null;
          window.addEventListener(eventName, (e: any) => { (window as any).tableEvent = e.detail; });
      }, EVENTS.SETTINGS.SHOW_RESULTS_TABLE_CHANGED);
      const tableToggle = sidebar.locator('#showResultsTableToggle');
      await tableToggle.check();
      await expect.poll(async () => await page.evaluate(() => (window as any).tableEvent)).toEqual({ showResultsTable: true });
  });
  
  test('should return selected benchmarks', async ({ page }) => {
      const uploadSidebar = page.locator('jrv-upload-sidebar');
      const fileInput = uploadSidebar.locator('#fileInput');
      await fileInput.setInputFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(
          '[{"benchmark": "b1", "primaryMetric": {"score": 1}, "mode": "avgt"}, {"benchmark": "b2", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
        ),
      });
      
      const sidebar = page.locator('jrv-settings-sidebar');
      
      const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
      await settingsButton.click();
      await expect(sidebar).not.toHaveClass(/collapsed/);
      
      let selected = await sidebar.evaluate((el: any) => el.getSelectedBenchmarks());
      expect(selected).toEqual(['b1', 'b2']);
      
      const b2Checkbox = sidebar.locator('input[value="b2"]');
      await b2Checkbox.uncheck();
      
      selected = await sidebar.evaluate((el: any) => el.getSelectedBenchmarks());
      expect(selected).toEqual(['b1']);
  });
  
  test('should return show class name state', async ({ page }) => {
      const sidebar = page.locator('jrv-settings-sidebar');
      
      let show = await sidebar.evaluate((el: any) => el.getShowClassName());
      expect(show).toBe(false);
      
      const uploadSidebar = page.locator('jrv-upload-sidebar');
      const fileInput = uploadSidebar.locator('#fileInput');
      await fileInput.setInputFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(
          '[{"benchmark": "b1", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
        ),
      });
      
      const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
      await settingsButton.click();
      await expect(sidebar).not.toHaveClass(/collapsed/);
      
      const fqcnToggle = sidebar.locator('#showClassNameToggle');
      await fqcnToggle.check();
      
      show = await sidebar.evaluate((el: any) => el.getShowClassName());
      expect(show).toBe(true);
  });
});
