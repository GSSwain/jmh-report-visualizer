/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvBenchmarkInsightsThrpt', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.evaluate(() => {
        const component = document.createElement('jrv-benchmark-insights-thrpt');
        document.body.appendChild(component);
    });
  });

  test('should render tables and controls', async ({ page }) => {
    const insights = page.locator('jrv-benchmark-insights-thrpt');
    await expect(insights).toBeAttached();
    
    await expect(insights.locator('h3').first()).toHaveText('Throughput Difference (Operations)');
    await expect(insights.locator('h3').nth(1)).toHaveText('Projected Normalized Throughput Difference per Core (Efficiency)');
    
    await expect(insights.locator('#baselineSelectThrpt')).toBeVisible();
  });

  test('should update with data and render rows', async ({ page }) => {
    const insights = page.locator('jrv-benchmark-insights-thrpt');
    
    const data = [
        { benchmark: 'bench1', mode: 'thrpt', primaryMetric: { score: 1000, scoreUnit: 'ops/s' }, params: { p: 1 } },
        { benchmark: 'bench2', mode: 'thrpt', primaryMetric: { score: 2000, scoreUnit: 'ops/s' }, params: { p: 1 } }
    ];
    
    await insights.evaluate((el: any, { data }) => {
        el.updateData(data, false, ['p']);
    }, { data });
    
    const rows = insights.locator('#thrptTableBody tr');
    await expect(rows).toHaveCount(2);
  });

  test('should handle different throughput units correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
        const component = document.querySelector('jrv-benchmark-insights-thrpt');
        
        const units = ['ops/ns', 'ops/us', 'ops/ms', 'ops/s', 'ops/unknown'];
        const results: { [key: string]: number } = {};
        
        units.forEach(unit => {
            results[unit] = (component as any).toOpsPerSecond(1, unit);
        });
        
        return results;
    });

    expect(result['ops/ns']).toBe(1_000_000_000);
    expect(result['ops/us']).toBe(1_000_000);
    expect(result['ops/ms']).toBe(1000);
    expect(result['ops/s']).toBe(1);
    expect(result['ops/unknown']).toBe(1);
  });
});
