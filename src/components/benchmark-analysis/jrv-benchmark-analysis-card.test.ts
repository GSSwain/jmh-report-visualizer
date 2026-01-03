/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvBenchmarkAnalysisCard', () => {
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

  test('should render chart and controls', async ({ page }) => {
    const chartGroup = page.locator('jrv-benchmark-analysis-card').first();
    await expect(chartGroup).toBeVisible();
    await expect(chartGroup.locator('h2').first()).toHaveText('Comparison Chart (avgt)');
    await expect(chartGroup.locator('jrv-comparison-chart-controls')).toBeVisible();
    await expect(chartGroup.locator('jrv-comparison-chart')).toBeVisible();
  });

  test('should update chart type', async ({ page }) => {
    const chartGroup = page.locator('jrv-benchmark-analysis-card').first();
    const chartTypeSelect = chartGroup.locator('#chartType');
    
    await chartTypeSelect.selectOption('line');
    
    await expect(chartTypeSelect).toHaveValue('line');
  });

  test('should toggle insights', async ({ page }) => {
    const chartGroup = page.locator('jrv-benchmark-analysis-card').first();
    const insightsCheckbox = chartGroup.locator('#displayInsights');
    const insights = chartGroup.locator('jrv-benchmark-insights');
    
    await expect(insights).toBeHidden();
    
    await insightsCheckbox.check();
    await expect(insights).toBeVisible();
    
    await insightsCheckbox.uncheck();
    await expect(insights).toBeHidden();
  });

  test('should download chart image', async ({ page }) => {
    const chartGroup = page.locator('jrv-benchmark-analysis-card').first();
    const downloadBtn = chartGroup.locator('#downloadChartBtn');
    
    // Ensure chart is rendered
    await expect(chartGroup.locator('jrv-comparison-chart canvas')).toBeVisible();
    
    // Wait for chart animation to complete
    await page.waitForTimeout(1000);

    const [ download ] = await Promise.all([
        page.waitForEvent('download'),
        downloadBtn.click()
    ]);
    
    expect(download.suggestedFilename()).toBe('comparison_chart_avgt.png');
  });
});
