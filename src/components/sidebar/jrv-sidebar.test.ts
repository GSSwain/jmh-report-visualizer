/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvSidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('jrv-upload-sidebar should be visible by default', async ({ page }) => {
    const sidebar = page.locator('jrv-upload-sidebar');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).not.toHaveClass(/collapsed/);
  });

  test('jrv-settings-sidebar should be collapsed by default', async ({
    page,
  }) => {
    const sidebar = page.locator('jrv-settings-sidebar');
    await expect(sidebar).toHaveClass(/collapsed/);
  });

  test('should toggle settings sidebar when the settings button is clicked', async ({
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
    const settingsButton = page.locator('jrv-menu-bar').locator('#settings-button');

    // Initially collapsed
    await expect(sidebar).toHaveClass(/collapsed/);

    // Click to expand
    await settingsButton.click();
    await expect(sidebar).not.toHaveClass(/collapsed/);

    // Click to collapse
    await settingsButton.click();
    await expect(sidebar).toHaveClass(/collapsed/);
  });

  test('should collapse sidebar when close button is clicked', async ({ page }) => {
    const sidebar = page.locator('jrv-upload-sidebar');
    
    // Ensure it's initially visible
    await expect(sidebar).not.toHaveClass(/collapsed/);
    
    // The close button is inside the shadow DOM of the base JrvSidebar class
    // Playwright pierces shadow DOM automatically
    const closeButton = sidebar.locator('#close-sidebar-btn');
    
    // We need to enable the close button first (it's hidden by default in upload sidebar logic until files are processed)
    // But wait, the base sidebar has it. The upload sidebar logic hides it:
    // if (closeButton) { closeButton.style.display = value ? 'block' : 'none'; }
    // And allowCollapse is false by default.
    
    // So we need to simulate a state where collapse is allowed.
    // We can do this by uploading a file, which sets allowCollapse = true.
    
    const fileInput = sidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
      ),
    });
    
    // After upload, it auto-collapses. Let's expand it again.
    const hamburger = page.locator('jrv-menu-bar').locator('#hamburger-menu');
    await hamburger.click();
    await expect(sidebar).not.toHaveClass(/collapsed/);
    
    // Now the close button should be visible and clickable
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    
    await expect(sidebar).toHaveClass(/collapsed/);
  });
});
