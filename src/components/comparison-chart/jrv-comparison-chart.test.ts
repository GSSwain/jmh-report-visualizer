/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvComparisonChart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render chart with data', async ({ page }) => {
    await page.evaluate(async () => {
        const chart = document.createElement('jrv-comparison-chart');
        document.body.appendChild(chart);
        await customElements.whenDefined('jrv-comparison-chart');
        
        const data = [
            {
                benchmark: 'test.benchmark',
                mode: 'avgt',
                primaryMetric: { score: 100, scoreUnit: 'ns/op' },
                params: { param1: 'value1' }
            }
        ];
        
        (chart as any).updateChart(data, 'column', 'Test Chart', false, ['param1']);
    });

    const canvas = page.locator('jrv-comparison-chart canvas');
    await expect(canvas).toBeVisible();
  });

  test('should clear chart when data is empty', async ({ page }) => {
    await page.evaluate(async () => {
        const chart = document.createElement('jrv-comparison-chart');
        document.body.appendChild(chart);
        await customElements.whenDefined('jrv-comparison-chart');
        
        const data = [
            {
                benchmark: 'test.benchmark',
                mode: 'avgt',
                primaryMetric: { score: 100, scoreUnit: 'ns/op' },
                params: { param1: 'value1' }
            }
        ];
        (chart as any).updateChart(data, 'column', 'Test Chart', false, ['param1']);
        
        (chart as any).updateChart([], 'column', 'Test Chart', false, ['param1']);
    });

    const canvas = page.locator('jrv-comparison-chart canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle different chart types', async ({ page }) => {
    await page.evaluate(async () => {
        const chart = document.createElement('jrv-comparison-chart');
        document.body.appendChild(chart);
        await customElements.whenDefined('jrv-comparison-chart');
        
        const data = [
            {
                benchmark: 'test.benchmark',
                mode: 'avgt',
                primaryMetric: { score: 100, scoreUnit: 'ns/op' },
                params: { param1: 'value1' }
            }
        ];
        
        (chart as any).updateChart(data, 'line', 'Test Chart', false, ['param1']);
    });
    
    const canvas = page.locator('jrv-comparison-chart canvas');
    await expect(canvas).toBeVisible();
  });
  
  test('should destroy existing chart before creating new one', async ({ page }) => {
      await page.evaluate(async () => {
          const chart: any = document.createElement('jrv-comparison-chart');
          document.body.appendChild(chart);
          await customElements.whenDefined('jrv-comparison-chart');
          
          const data = [
              {
                  benchmark: 'test.benchmark',
                  mode: 'avgt',
                  primaryMetric: { score: 100, scoreUnit: 'ns/op' },
                  params: { param1: 'value1' }
              }
          ];
          
          chart.updateChart(data, 'column', 'Test Chart', false, ['param1']);
          const firstChartInstance = chart.chart;
          
          chart.updateChart(data, 'column', 'Test Chart', false, ['param1']);
          const secondChartInstance = chart.chart;
          
          if (firstChartInstance === secondChartInstance) {
              throw new Error('Chart instance was not recreated');
          }
      });
  });
});
