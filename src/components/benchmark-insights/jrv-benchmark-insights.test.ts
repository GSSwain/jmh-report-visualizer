/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvBenchmarkInsights', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should be hidden by default', async ({ page }) => {
    const insights = page.locator('jrv-benchmark-insights');
    await expect(insights).toBeHidden();
  });

  test('should become visible when "Display Insights" is checked', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test.a", "primaryMetric": {"score": 10, "scoreUnit": "ns/op"}, "mode": "avgt"}, {"benchmark": "test.b", "primaryMetric": {"score": 20, "scoreUnit": "ns/op"}, "mode": "avgt"}]'
      ),
    });

    await expect(page.locator('jrv-main-content > div').first()).toBeVisible();

    const chartGroup = page.locator('jrv-benchmark-analysis-card');
    const insightsCheckbox = chartGroup.locator('#displayInsights');
    const insightsComponent = chartGroup.locator('jrv-benchmark-insights');

    await expect(insightsComponent).toBeHidden();

    await insightsCheckbox.check();

    await expect(insightsComponent).toBeVisible();
  });

  test('should show a WIP warning', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test.a", "primaryMetric": {"score": 10, "scoreUnit": "ns/op"}, "mode": "avgt"}, {"benchmark": "test.b", "primaryMetric": {"score": 20, "scoreUnit": "ns/op"}, "mode": "avgt"}]'
      ),
    });

    await expect(page.locator('jrv-main-content > div').first()).toBeVisible();

    const chartGroup = page.locator('jrv-benchmark-analysis-card');
    const insightsCheckbox = chartGroup.locator('#displayInsights');
    await insightsCheckbox.check();

    const insightsComponent = chartGroup.locator('jrv-benchmark-insights');
    // Since we are in avgt mode, check warnings inside benchmark-insights-avgt
    const avgtInsights = insightsComponent.locator('jrv-benchmark-insights-avgt');
    const warning = avgtInsights.locator('.wip-warning').first();
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('experimental estimates');
  });

  test('should show avgt insights for avgt mode', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test.a", "primaryMetric": {"score": 10, "scoreUnit": "ns/op"}, "mode": "avgt"}, {"benchmark": "test.b", "primaryMetric": {"score": 20, "scoreUnit": "ns/op"}, "mode": "avgt"}]'
      ),
    });

    await expect(page.locator('jrv-main-content > div').first()).toBeVisible();

    const chartGroup = page.locator('jrv-benchmark-analysis-card');
    const insightsCheckbox = chartGroup.locator('#displayInsights');
    await insightsCheckbox.check();

    const insightsComponent = chartGroup.locator('jrv-benchmark-insights');
    const avgtInsights = insightsComponent.locator('jrv-benchmark-insights-avgt');
    const thrptInsights = insightsComponent.locator('jrv-benchmark-insights-thrpt');

    await expect(avgtInsights).toBeVisible();
    await expect(thrptInsights).toBeHidden();
  });

  test('should show thrpt insights for thrpt mode', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test.a", "primaryMetric": {"score": 100, "scoreUnit": "ops/s"}, "mode": "thrpt"}, {"benchmark": "test.b", "primaryMetric": {"score": 200, "scoreUnit": "ops/s"}, "mode": "thrpt"}]'
      ),
    });

    await expect(page.locator('jrv-main-content > div').first()).toBeVisible();

    const chartGroup = page.locator('jrv-benchmark-analysis-card');
    const insightsCheckbox = chartGroup.locator('#displayInsights');
    await insightsCheckbox.check();

    const insightsComponent = chartGroup.locator('jrv-benchmark-insights');
    const avgtInsights = insightsComponent.locator('jrv-benchmark-insights-avgt');
    const thrptInsights = insightsComponent.locator('jrv-benchmark-insights-thrpt');

    await expect(thrptInsights).toBeVisible();
    await expect(avgtInsights).toBeHidden();
  });
});
