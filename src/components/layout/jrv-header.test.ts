/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvHeader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render header title', async ({ page }) => {
    const header = page.locator('jrv-header');
    await expect(header).toBeVisible();
    
    const title = header.locator('h1');
    await expect(title).toHaveText('JMH Report Visualizer');
  });
});
