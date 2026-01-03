/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvGistLoader', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render gist input and button', async ({ page }) => {
    const loader = page.locator('jrv-gist-loader');
    await expect(loader).toBeAttached();
    
    const h3 = loader.locator('h3');
    await expect(h3).toBeVisible();
    await expect(h3).toHaveText('Load from GitHub Gist');
    
    const input = loader.locator('input[type="text"]');
    await expect(input).toBeVisible();
    
    const button = loader.locator('button');
    await expect(button).toHaveText('Load from Gist');
  });

  test('should dispatch status-update on invalid URL', async ({ page }) => {
    const input = page.locator('jrv-gist-loader input[type="text"]');
    const button = page.locator('jrv-gist-loader button');

    await input.fill('invalid-url');

    const [detail] = await Promise.all([
      page.evaluate(() => {
        return new Promise(resolve => {
          window.addEventListener('jrv:upload:status-update', (e: any) => resolve(e.detail), { once: true });
        });
      }),
      button.click()
    ]);

    expect((detail as any).message).toBe('Invalid Gist URL format.');
  });

  test('should dispatch files-uploaded on successful load', async ({ page }) => {
    const validGistId = 'c724d78f175ebf8daa62761a138ff9ff';
    await page.route(`https://api.github.com/gists/${validGistId}`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                files: {
                    'bench.json': { filename: 'bench.json', content: '[]' }
                }
            })
        });
    });

    const input = page.locator('jrv-gist-loader input[type="text"]');
    const button = page.locator('jrv-gist-loader button');

    await input.fill(`https://gist.github.com/${validGistId}`);

    const [detail] = await Promise.all([
      page.evaluate(() => {
        return new Promise(resolve => {
          window.addEventListener('jrv:upload:file-uploaded', (e: any) => resolve(e.detail), { once: true });
        });
      }),
      button.click()
    ]);

    expect((detail as any).files).toHaveLength(1);
    expect((detail as any).files[0].fileName).toBe('bench.json');
  });
});
