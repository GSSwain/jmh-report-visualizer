/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvAppLayout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle transitionend on upload-sidebar', async ({ page }) => {
      const layout = page.locator('jrv-app-layout');
      const uploadSidebar = layout.locator('jrv-upload-sidebar');
      const menuBar = layout.locator('jrv-menu-bar');
      
      const hamburger = menuBar.locator('#hamburger-menu');
      await expect(hamburger).toBeHidden();
      
      await uploadSidebar.evaluate(el => {
          el.classList.add('collapsed');
          el.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'left' }));
      });
      
      await expect(hamburger).toBeVisible();
  });

  test('should not close upload sidebar if allowCollapse is false', async ({ page }) => {
      const layout = page.locator('jrv-app-layout');
      const uploadSidebar = layout.locator('jrv-upload-sidebar');
      
      await layout.evaluate((el: any) => el.toggleUploadSidebar());
      
      await expect(uploadSidebar).not.toHaveClass(/collapsed/);
  });
});
