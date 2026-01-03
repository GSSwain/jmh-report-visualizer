/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';
import { EVENTS } from '../../events.js';

test.describe('JrvBenchmarkSelector', () => {
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
            {"benchmark": "b1", "primaryMetric": {"score": 1}, "mode": "avgt"},
            {"benchmark": "b2", "primaryMetric": {"score": 2}, "mode": "avgt"}
        ])
      ),
    });
    
    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');
    await settingsButton.click();
  });

  test('should render benchmark checkboxes', async ({ page }) => {
    const selector = page.locator('jrv-benchmark-selector');
    await expect(selector).toBeVisible();
    
    const checkboxes = selector.locator('input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(2);
    
    await expect(selector.locator('label').first()).toContainText('b1');
    await expect(selector.locator('label').nth(1)).toContainText('b2');
    
    await expect(checkboxes.first()).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
  });

  test('should dispatch benchmark-selection-changed event', async ({ page }) => {
    const selector = page.locator('jrv-benchmark-selector');
    const checkbox = selector.locator('input[value="b2"]');
    
    const eventPromise = new Promise(resolve => {
        page.exposeFunction('onBenchmarkSelectionChanged', () => resolve(true));
    });

    await page.evaluate((eventName) => {
        window.addEventListener(eventName, () => {
            (window as any).onBenchmarkSelectionChanged();
        }, { once: true });
    }, EVENTS.SETTINGS.BENCHMARK_SELECTION_CHANGED);

    await checkbox.uncheck();
    
    await eventPromise;
  });

  test('should return selected benchmarks', async ({ page }) => {
    const selector = page.locator('jrv-benchmark-selector');
    
    let selected = await selector.evaluate((el: any) => el.getSelectedBenchmarks());
    expect(selected).toEqual(['b1', 'b2']);
    
    const b2Checkbox = selector.locator('input[value="b2"]');
    await b2Checkbox.uncheck();
    
    selected = await selector.evaluate((el: any) => el.getSelectedBenchmarks());
    expect(selected).toEqual(['b1']);
  });
});
