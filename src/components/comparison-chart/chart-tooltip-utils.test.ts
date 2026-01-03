/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('ChartTooltipUtils', () => {
  test.beforeEach(async ({ page }) => {
    // Enable testing mode to expose internal functions
    await page.addInitScript(() => {
        (window as any).JRV_TESTING = true;
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Ensure the component that exposes the function is loaded
    // We can just create one to trigger connectedCallback
    await page.evaluate(() => {
        const chart = document.createElement('jrv-comparison-chart');
        document.body.appendChild(chart);
    });
  });

  test('should update tooltip element (standard)', async ({ page }) => {
    await page.evaluate(() => {
        const tooltipEl = document.createElement('div');
        tooltipEl.id = 'tooltip';
        document.body.appendChild(tooltipEl);
        
        const context = {
            chart: {
                canvas: { offsetLeft: 10, offsetTop: 20, offsetWidth: 500 },
                options: { indexAxis: 'x' }
            },
            tooltip: {
                opacity: 1,
                body: [{}],
                title: ['My Title'],
                dataPoints: [
                    {
                        dataset: { label: 'Dataset 1', borderColor: 'red' },
                        parsed: { y: 123.456 }
                    }
                ],
                caretX: 50,
                caretY: 60
            }
        };

        (window as any).Jrv.chartTooltipHandler(context, tooltipEl);
    });

    const tooltip = page.locator('#tooltip');
    await expect(tooltip).toHaveCSS('opacity', '1');
    await expect(tooltip).toContainText('My Title');
    await expect(tooltip).toContainText('Score: 123.46');
  });

  test('should hide tooltip when opacity is 0', async ({ page }) => {
    await page.evaluate(() => {
        const tooltipEl = document.createElement('div');
        tooltipEl.id = 'tooltip';
        document.body.appendChild(tooltipEl);
        
        const context = {
            chart: {},
            tooltip: { opacity: 0 }
        };
        (window as any).Jrv.chartTooltipHandler(context, tooltipEl);
    });
    const tooltip = page.locator('#tooltip');
    await expect(tooltip).toHaveCSS('opacity', '0');
  });

  test('should handle missing title and label', async ({ page }) => {
    await page.evaluate(() => {
        const tooltipEl = document.createElement('div');
        tooltipEl.id = 'tooltip';
        document.body.appendChild(tooltipEl);
        
        const context = {
            chart: {
                canvas: { offsetLeft: 0, offsetTop: 0, offsetWidth: 500 },
                options: { indexAxis: 'x' }
            },
            tooltip: {
                opacity: 1,
                body: [{}],
                title: [],
                dataPoints: [
                    {
                        dataset: { label: null, borderColor: null },
                        parsed: { y: 100 }
                    }
                ],
                caretX: 0,
                caretY: 0
            }
        };
        (window as any).Jrv.chartTooltipHandler(context, tooltipEl);
    });
    
    const tooltip = page.locator('#tooltip');
    await expect(tooltip).toContainText('');
  });

  test('should handle horizontal chart (indexAxis: y)', async ({ page }) => {
    await page.evaluate(() => {
        const tooltipEl = document.createElement('div');
        tooltipEl.id = 'tooltip';
        document.body.appendChild(tooltipEl);
        
        const context = {
            chart: {
                canvas: { offsetLeft: 0, offsetTop: 0, offsetWidth: 500 },
                options: { indexAxis: 'y' }
            },
            tooltip: {
                opacity: 1,
                body: [{}],
                title: ['Title'],
                dataPoints: [
                    {
                        dataset: { label: 'D1' },
                        parsed: { x: 50, y: 0 }
                    }
                ],
                caretX: 0,
                caretY: 0
            }
        };
        (window as any).Jrv.chartTooltipHandler(context, tooltipEl);
    });

    const tooltip = page.locator('#tooltip');
    await expect(tooltip).toContainText('Score: 50.00');
  });

  test('should handle missing value (N/A)', async ({ page }) => {
    await page.evaluate(() => {
        const tooltipEl = document.createElement('div');
        tooltipEl.id = 'tooltip';
        document.body.appendChild(tooltipEl);
        
        const context = {
            chart: {
                canvas: { offsetLeft: 0, offsetTop: 0, offsetWidth: 500 },
                options: { indexAxis: 'x' }
            },
            tooltip: {
                opacity: 1,
                body: [{}],
                title: ['Title'],
                dataPoints: [
                    {
                        dataset: { label: 'D1' },
                        parsed: { y: null }
                    }
                ],
                caretX: 0,
                caretY: 0
            }
        };
        (window as any).Jrv.chartTooltipHandler(context, tooltipEl);
    });

    const tooltip = page.locator('#tooltip');
    await expect(tooltip).toContainText('Score: N/A');
  });
});
