/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvSettingsPanel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show no-data message by default', async ({ page }) => {
    const panel = page.locator('jrv-settings-sidebar jrv-settings-panel');
    
    const noDataMessage = panel.locator('#no-data-message');
    await expect(noDataMessage).not.toHaveClass(/hidden/);
    
    const settingsContent = panel.locator('#settings-content');
    await expect(settingsContent).toHaveClass(/hidden/);
  });

  test('should show settings content when data is loaded', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
      ),
    });

    const panel = page.locator('jrv-settings-sidebar jrv-settings-panel');
    const noDataMessage = panel.locator('#no-data-message');
    await expect(noDataMessage).toHaveClass(/hidden/);
    
    const settingsContent = panel.locator('#settings-content');
    await expect(settingsContent).not.toHaveClass(/hidden/);
    
    // Expand the sidebar to check for visibility of children
    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
    await settingsButton.click();
    
    await expect(panel.locator('jrv-benchmark-selector')).toBeVisible();
    await expect(panel.locator('jrv-display-options')).toBeVisible();
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

    const panel = page.locator('jrv-settings-sidebar jrv-settings-panel');
    
    let selected = await panel.evaluate((el: any) => el.getSelectedBenchmarks());
    expect(selected).toEqual(['b1', 'b2']);
    
    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
    await settingsButton.click();
    
    const b2Checkbox = panel.locator('input[value="b2"]');
    await b2Checkbox.uncheck();
    
    selected = await panel.evaluate((el: any) => el.getSelectedBenchmarks());
    expect(selected).toEqual(['b1']);
  });

  test('should return show class name state', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "b1", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
      ),
    });

    const panel = page.locator('jrv-settings-sidebar jrv-settings-panel');
    
    let show = await panel.evaluate((el: any) => el.getShowClassName());
    expect(show).toBe(false);
    
    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
    await settingsButton.click();
    
    const fqcnToggle = panel.locator('#showClassNameToggle');
    await fqcnToggle.check();
    
    show = await panel.evaluate((el: any) => el.getShowClassName());
    expect(show).toBe(true);
  });
});
