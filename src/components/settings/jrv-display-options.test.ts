/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';
import { EVENTS } from '../../events.js';

test.describe('JrvDisplayOptions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // We need to load data and open settings to interact with this component
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
  });

  test('should render toggles', async ({ page }) => {
    const displayOptions = page.locator('jrv-display-options');
    await expect(displayOptions).toBeVisible();
    
    await expect(displayOptions.locator('h3')).toHaveText('Display Options');
    await expect(displayOptions.locator('#showClassNameToggle')).toBeVisible();
    await expect(displayOptions.locator('#showResultsTableToggle')).toBeVisible();
  });

  test('should dispatch show-fqcn-changed event', async ({ page }) => {
    const displayOptions = page.locator('jrv-display-options');
    const toggle = displayOptions.locator('#showClassNameToggle');
    
    const eventPromise = new Promise(resolve => {
        page.exposeFunction('onShowFQCNChanged', (detail: any) => resolve(detail));
    });

    await page.evaluate((eventName) => {
        window.addEventListener(eventName, (e: any) => {
            (window as any).onShowFQCNChanged(e.detail);
        }, { once: true });
    }, EVENTS.SETTINGS.SHOW_FQCN_CHANGED);

    await toggle.check();
    
    const detail: any = await eventPromise;
    expect(detail.showFullyQualifiedClassName).toBe(true);
  });

  test('should dispatch show-results-table-changed event', async ({ page }) => {
    const displayOptions = page.locator('jrv-display-options');
    const toggle = displayOptions.locator('#showResultsTableToggle');
    
    const eventPromise = new Promise(resolve => {
        page.exposeFunction('onShowResultsTableChanged', (detail: any) => resolve(detail));
    });

    await page.evaluate((eventName) => {
        window.addEventListener(eventName, (e: any) => {
            (window as any).onShowResultsTableChanged(e.detail);
        }, { once: true });
    }, EVENTS.SETTINGS.SHOW_RESULTS_TABLE_CHANGED);

    await toggle.check();
    
    const detail: any = await eventPromise;
    expect(detail.showResultsTable).toBe(true);
  });

  test('should return show class name state', async ({ page }) => {
    const displayOptions = page.locator('jrv-display-options');
    const toggle = displayOptions.locator('#showClassNameToggle');
    
    let show = await displayOptions.evaluate((el: any) => el.getShowClassName());
    expect(show).toBe(false);
    
    await toggle.check();
    
    show = await displayOptions.evaluate((el: any) => el.getShowClassName());
    expect(show).toBe(true);
  });
});
