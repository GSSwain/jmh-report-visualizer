/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';
import { EVENTS } from '../../events.js';

test.describe('JrvParameterFilters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
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

  test('should render filters for varying parameters', async ({ page }) => {
    const filters = page.locator('jrv-parameter-filters');
    await expect(filters).toBeVisible();
    
    const p1Select = filters.locator('select[data-param="p1"]');
    await expect(p1Select).toBeVisible();
    
    const p2Select = filters.locator('select[data-param="p2"]');
    await expect(p2Select).toBeVisible();
  });

  test('should dispatch jrv:filters:changed on selection change', async ({ page }) => {
    const filters = page.locator('jrv-parameter-filters');
    const p1Select = filters.locator('select[data-param="p1"]');
    
    const eventPromise = new Promise(resolve => {
        page.exposeFunction('onFiltersChanged', (detail: any) => resolve(detail));
    });

    await page.evaluate((eventName) => {
        window.addEventListener(eventName, (e: any) => {
            (window as any).onFiltersChanged(e.detail);
        }, { once: true });
    }, EVENTS.FILTERS.CHANGED);

    await p1Select.selectOption('v1');

    const detail: any = await eventPromise;
    
    const expectedFilters = [
        { param: 'p1', values: ['v1'] },
        { param: 'p2', values: ['a', 'b'] }
    ];
    
    const sortFn = (a: any, b: any) => a.param.localeCompare(b.param);
    
    expect(detail.filters.sort(sortFn)).toEqual(expectedFilters.sort(sortFn));
  });
  
  test('should reset filters', async ({ page }) => {
      const filters = page.locator('jrv-parameter-filters');
      
      await expect(filters).toBeVisible();
      
      await page.evaluate(() => {
          const mainContent = document.querySelector('jrv-app')?.shadowRoot?.querySelector('jrv-main-content');
          (mainContent as any)?.resetParameterFilters();
      });
      
      await expect(filters).toBeHidden();
  });
});
