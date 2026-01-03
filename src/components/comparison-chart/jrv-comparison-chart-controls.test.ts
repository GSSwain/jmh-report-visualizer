/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';
import { EVENTS } from '../../events.js';

test.describe('JrvComparisonChartControls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test.a", "primaryMetric": {"score": 10, "scoreUnit": "ns/op"}, "mode": "avgt"}]'
      ),
    });
    await expect(page.locator('jrv-main-content > div').first()).toBeVisible();
  });

  test('should display all controls', async ({ page }) => {
    const controls = page.locator('jrv-comparison-chart-controls').first();
    await expect(controls.locator('#displayInsights')).toBeVisible();
    await expect(controls.locator('#chartType')).toBeVisible();
    await expect(controls.locator('#downloadChartBtn')).toBeVisible();
  });

  test('should have "Display Insights" unchecked by default', async ({ page }) => {
    const controls = page.locator('jrv-comparison-chart-controls').first();
    await expect(controls.locator('#displayInsights')).not.toBeChecked();
  });

  test('should have "column" as default chart type', async ({ page }) => {
    const controls = page.locator('jrv-comparison-chart-controls').first();
    await expect(controls.locator('#chartType')).toHaveValue('column');
  });

  test('should fire "jrv:chart:show-insights-clicked" event on click', async ({ page }) => {
    const controls = page.locator('jrv-comparison-chart-controls').first();
    const insightsCheckbox = controls.locator('#displayInsights');
    
    const eventPromise = new Promise(resolve => {
        page.exposeFunction('onShowInsightsClicked', (detail: any) => resolve(detail));
    });

    await page.evaluate((eventName) => {
        window.addEventListener(eventName, (e: any) => {
            (window as any).onShowInsightsClicked(e.detail);
        }, { once: true });
    }, EVENTS.CHART.SHOW_INSIGHTS_CLICKED);

    await insightsCheckbox.click();
    const detail: any = await eventPromise;
    expect(detail.showInsights).toBe(true);
  });

  test('should fire "jrv:chart:chart-type-changed" event on selection', async ({ page }) => {
    const controls = page.locator('jrv-comparison-chart-controls').first();
    const chartTypeSelect = controls.locator('#chartType');
    
    const eventPromise = new Promise(resolve => {
        page.exposeFunction('onChartTypeChanged', (detail: any) => resolve(detail));
    });

    await page.evaluate((eventName) => {
        window.addEventListener(eventName, (e: any) => {
            (window as any).onChartTypeChanged(e.detail);
        }, { once: true });
    }, EVENTS.CHART.CHART_TYPE_CHANGED);

    await chartTypeSelect.selectOption('line');
    const detail: any = await eventPromise;
    expect(detail.chartType).toBe('line');
  });

  test('should initialize with chart-type attribute', async ({ page }) => {
      await page.evaluate(() => {
          const controls = document.createElement('jrv-comparison-chart-controls');
          controls.id = 'test-controls-init';
          controls.setAttribute('chart-type', 'line');
          document.body.appendChild(controls);
      });
      
      const controls = page.locator('#test-controls-init');
      const select = controls.locator('#chartType');
      await expect(select).toHaveValue('line');
  });

  test('should set chartType property before connection', async ({ page }) => {
      const type = await page.evaluate(() => {
          const controls: any = document.createElement('jrv-comparison-chart-controls');
          controls.chartType = 'bar';
          return controls.getAttribute('chart-type');
      });
      expect(type).toBe('bar');
  });
  
  test('should set chartType property after connection', async ({ page }) => {
      await page.evaluate(() => {
          const controls: any = document.createElement('jrv-comparison-chart-controls');
          controls.id = 'test-controls-prop';
          document.body.appendChild(controls);
          controls.chartType = 'line';
      });
      
      const controls = page.locator('#test-controls-prop');
      const select = controls.locator('#chartType');
      await expect(select).toHaveValue('line');
  });
});
