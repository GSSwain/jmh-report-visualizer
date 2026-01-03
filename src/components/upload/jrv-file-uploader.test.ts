/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';
import { EVENTS } from '../../events.js';

test.describe('JrvFileUploader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render file input', async ({ page }) => {
    const uploader = page.locator('jrv-file-uploader');
    await expect(uploader).toBeAttached();
    
    const h3 = uploader.locator('h3');
    await expect(h3).toBeVisible();
    await expect(h3).toHaveText('Upload JMH Reports');
    
    const input = uploader.locator('input[type="file"]');
    await expect(input).toBeVisible();
  });

  test('should dispatch files-uploaded event on file selection', async ({ page }) => {
    const fileInput = page.locator('jrv-file-uploader input[type="file"]');

    const [detail] = await Promise.all([
      page.evaluate((eventName) => {
        return new Promise(resolve => {
          window.addEventListener(eventName, (e: any) => resolve(e.detail), { once: true });
        });
      }, EVENTS.UPLOAD.FILES_UPLOADED),
      fileInput.setInputFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from('[]'),
      })
    ]);

    expect((detail as any).files).toHaveLength(1);
    expect((detail as any).files[0].fileName).toBe('test.json');
  });

  test('should reset input value', async ({ page }) => {
      const uploader = page.locator('jrv-file-uploader');
      const fileInput = uploader.locator('input[type="file"]');
      
      await fileInput.setInputFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from('[]'),
      });
      
      let value = await fileInput.evaluate((el: HTMLInputElement) => el.value);
      expect(value).not.toBe('');
      
      await uploader.evaluate((el: any) => el.reset());
      
      value = await fileInput.evaluate((el: HTMLInputElement) => el.value);
      expect(value).toBe('');
  });
});
