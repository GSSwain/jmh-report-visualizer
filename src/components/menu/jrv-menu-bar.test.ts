/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';
import { EVENTS } from '../../events.js';

test.describe('JrvMenuBar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  test('should render buttons', async ({ page }) => {
    const menuBar = page.locator('jrv-menu-bar');
    await expect(menuBar).toBeAttached();
    
    // Initial state:
    // Upload sidebar is open -> Hamburger hidden
    await expect(menuBar.locator('#hamburger-menu')).toBeHidden();
    
    // Settings sidebar is collapsed -> Settings button is visible
    await expect(menuBar.locator('#settings-button')).toBeVisible();
  });

  test('should dispatch toggle events', async ({ page }) => {
    const menuBar = page.locator('jrv-menu-bar');
    const hamburger = menuBar.locator('#hamburger-menu');
    const settings = menuBar.locator('#settings-button');

    // 1. Upload a file to collapse upload sidebar and show hamburger
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
      ),
    });
    
    // Wait for hamburger to become visible
    await expect(hamburger).toBeVisible();
    
    // 2. Test Hamburger click
    const hamburgerPromise = page.evaluate((eventName) => {
        return new Promise(resolve => {
            window.addEventListener(eventName, () => resolve(true), { once: true });
        });
    }, EVENTS.MENU.HAMBURGER_BUTTON_CLICKED);
    
    await hamburger.click();
    await expect(hamburgerPromise).resolves.toBe(true);
    
    // 3. Test Settings click (it is visible initially)
    await expect(settings).toBeVisible();
    
    const settingsPromise = page.evaluate((eventName) => {
        return new Promise(resolve => {
            window.addEventListener(eventName, () => resolve(true), { once: true });
        });
    }, EVENTS.MENU.SETTINGS_BUTTON_CLICKED);
    
    await settings.click();
    await expect(settingsPromise).resolves.toBe(true);
  });

  test('should toggle visibility', async ({ page }) => {
      const menuBar = page.locator('jrv-menu-bar');
      const hamburger = menuBar.locator('#hamburger-menu');
      const settings = menuBar.locator('#settings-button');
      
      // Initial state
      await expect(hamburger).toBeHidden();
      await expect(settings).toBeVisible();
      
      // Toggle hamburger
      await menuBar.evaluate((el: any) => el.toggleHamburgerVisibility(true));
      await expect(hamburger).toBeVisible();
      await menuBar.evaluate((el: any) => el.toggleHamburgerVisibility(false));
      await expect(hamburger).toBeHidden();
      
      // Toggle settings
      await menuBar.evaluate((el: any) => el.toggleSettingsButtonVisibility(false));
      await expect(settings).toBeHidden();
      await menuBar.evaluate((el: any) => el.toggleSettingsButtonVisibility(true));
      await expect(settings).toBeVisible();
  });
});
