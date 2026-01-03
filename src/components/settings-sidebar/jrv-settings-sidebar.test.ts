/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvSettingsSidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have the hidden attribute by default', async ({ page }) => {
    const sidebar = page.locator('jrv-settings-sidebar');
    // The sidebar is not hidden by default anymore, jrv-app-layout controls its visibility
    // It should be collapsed by default
    await expect(sidebar).toHaveClass(/collapsed/);
  });

  test('should not have the hidden attribute after successful file upload', async ({
    page,
  }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
      ),
    });

    const sidebar = page.locator('jrv-settings-sidebar');
    await expect(sidebar).not.toHaveAttribute('hidden', '');
  });
});
