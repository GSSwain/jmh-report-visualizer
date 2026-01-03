/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvBenchmarkInsightsAvgt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.evaluate(() => {
        const component = document.createElement('jrv-benchmark-insights-avgt');
        document.body.appendChild(component);
    });
  });

  test('should render tables and controls', async ({ page }) => {
    const insights = page.locator('jrv-benchmark-insights-avgt');
    await expect(insights).toBeAttached();
    
    await expect(insights.locator('h3').first()).toHaveText('Projected Wall-Clock Time Savings');
    await expect(insights.locator('h3').nth(1)).toHaveText('Projected Normalized CPU Time Savings (Cost Efficiency)');
    
    await expect(insights.locator('#baselineSelectAvgt')).toBeVisible();
  });

  test('should update with data and render rows', async ({ page }) => {
    const insights = page.locator('jrv-benchmark-insights-avgt');
    
    const data = [
        { benchmark: 'bench1', mode: 'avgt', primaryMetric: { score: 10, scoreUnit: 'ns/op' }, params: { p: 1 } },
        { benchmark: 'bench2', mode: 'avgt', primaryMetric: { score: 20, scoreUnit: 'ns/op' }, params: { p: 1 } }
    ];
    
    await insights.evaluate((el: any, { data }) => {
        el.updateData(data, false, ['p']);
    }, { data });
    
    const rows = insights.locator('#avgtTableBody tr');
    await expect(rows).toHaveCount(2);
  });

  test('should handle different time units correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
        const component = document.querySelector('jrv-benchmark-insights-avgt');
        
        const units = ['ns/op', 'us/op', 'ms/op', 's/op', 'unknown/op'];
        const results: { [key: string]: number } = {};
        
        units.forEach(unit => {
            results[unit] = (component as any).toNanoseconds(1, unit);
        });
        
        return results;
    });

    expect(result['ns/op']).toBe(1);
    expect(result['us/op']).toBe(1000);
    expect(result['ms/op']).toBe(1_000_000);
    expect(result['s/op']).toBe(1_000_000_000);
    expect(result['unknown/op']).toBe(1);
  });
});
