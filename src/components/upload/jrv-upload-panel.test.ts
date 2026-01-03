/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';
import { EVENTS } from '../../events.js';

test.describe('JrvUploadPanel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render child components', async ({ page }) => {
    const panel = page.locator('jrv-upload-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('jrv-file-uploader')).toBeVisible();
    await expect(panel.locator('jrv-gist-loader')).toBeVisible();
  });

  test('should handle file upload and dispatch files-processed', async ({ page }) => {
    const panel = page.locator('jrv-upload-panel');
    const fileInput = panel.locator('jrv-file-uploader input[type="file"]');
    
    const [detail] = await Promise.all([
      page.evaluate((eventName) => {
        return new Promise(resolve => {
          window.addEventListener(eventName, (e: any) => resolve(e.detail), { once: true });
        });
      }, EVENTS.UPLOAD.FILES_PROCESSED),
      fileInput.setInputFiles({
        name: 'test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(
          '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
        ),
      })
    ]);

    expect((detail as any).allBenchmarkFiles).toHaveLength(1);
    expect((detail as any).allBenchmarkFiles[0].fileName).toBe('test.json');
  });

  test('should remove gistId from URL on file upload', async ({ page }) => {
    const autoLoadGistId = 'c724d78f175ebf8daa62761a138ff9ee';
    await page.route(`https://api.github.com/gists/${autoLoadGistId}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: {
            'bench.json': {
              filename: 'bench.json',
              content: '[{"benchmark": "test", "primaryMetric": {"score": 10, "scoreUnit": "ns/op"}, "mode": "avgt"}]'
            }
          }
        })
      });
    });

    await page.goto(`/?gistId=${autoLoadGistId}`);
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain(`gistId=${autoLoadGistId}`);
    
    const panel = page.locator('jrv-upload-panel');
    const fileInput = panel.locator('jrv-file-uploader input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'local.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "local", "primaryMetric": {"score": 20, "scoreUnit": "ns/op"}, "mode": "avgt"}]'
      ),
    });
    
    await expect.poll(async () => {
        return page.url();
    }).not.toContain('gistId=');
  });

  test('should highlight gist zone on focus', async ({ page }) => {
    const panel = page.locator('jrv-upload-panel');
    const gistInput = panel.locator('jrv-gist-loader input[type="text"]');
    const gistZone = panel.locator('#gistLoadZone');
    
    await expect(gistZone).not.toHaveClass(/active/);
    
    await gistInput.focus();
    await expect(gistZone).toHaveClass(/active/);
    
    await gistInput.blur();
    await expect(gistZone).not.toHaveClass(/active/);
  });

  test('should reset file uploader when gist is loaded', async ({ page }) => {
    const panel = page.locator('jrv-upload-panel');
    const fileInput = panel.locator('jrv-file-uploader input[type="file"]');
    
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from('[]'),
    });
    
    let value = await fileInput.evaluate((el: HTMLInputElement) => el.value);
    expect(value).not.toBe('');
    
    const validGistId = 'c724d78f175ebf8daa62761a138ff9ff';
    await page.route(`https://api.github.com/gists/${validGistId}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: {
            'bench.json': {
              filename: 'bench.json',
              content: '[{"benchmark": "test", "primaryMetric": {"score": 10}, "mode": "avgt"}]'
            }
          }
        })
      });
    });

    const gistInput = panel.locator('jrv-gist-loader input[type="text"]');
    const loadBtn = panel.locator('jrv-gist-loader button');
    
    await gistInput.fill(`https://gist.github.com/${validGistId}`);
    await loadBtn.click();
    
    await expect.poll(async () => {
        return await fileInput.evaluate((el: HTMLInputElement) => el.value);
    }).toBe('');
  });
});
