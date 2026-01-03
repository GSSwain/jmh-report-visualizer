/* istanbul ignore file */
import { test, expect } from '../../test-utils.js';

test.describe('JrvUploadSidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle invalid file upload', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    const status = uploadSidebar.locator('#uploadStatus');

    await fileInput.setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: Buffer.from('invalid json content'),
    });

    await expect(status).toHaveText('No valid JMH report files were found.');
  });

  test('should handle file with invalid JMH structure', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const fileInput = uploadSidebar.locator('#fileInput');
    const status = uploadSidebar.locator('#uploadStatus');

    await fileInput.setInputFiles({
      name: 'invalid-structure.json',
      mimeType: 'application/json',
      buffer: Buffer.from('[{"foo": "bar"}]'),
    });

    await expect(status).toHaveText('No valid JMH report files were found.');
  });

  test('should load from Gist', async ({ page }) => {
    const validGistId = 'c724d78f175ebf8daa62761a138ff9ff';
    await page.route(`https://api.github.com/gists/${validGistId}`, async route => {
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

    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const gistInput = uploadSidebar.locator('#gistUrlInput');
    const loadBtn = uploadSidebar.locator('#loadGistBtn');
    const status = uploadSidebar.locator('#uploadStatus');

    await gistInput.fill(`https://gist.github.com/${validGistId}`);
    await loadBtn.click();

    await expect(status).toHaveText('1 valid JMH report(s) loaded.');
    await expect(uploadSidebar).toHaveClass(/collapsed/);
  });

  test('should handle Gist load error', async ({ page }) => {
    const invalidGistId = 'c724d78f175ebf8daa62761a138ff9fe';
    await page.route(`https://api.github.com/gists/${invalidGistId}`, async route => {
        await route.fulfill({ status: 404 });
    });

    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const gistInput = uploadSidebar.locator('#gistUrlInput');
    const loadBtn = uploadSidebar.locator('#loadGistBtn');
    const status = uploadSidebar.locator('#uploadStatus');

    await gistInput.fill(`https://gist.github.com/${invalidGistId}`);
    await loadBtn.click();

    await expect(status).toContainText('Error loading Gist: Gist not found');
  });

  test('should handle empty Gist URL', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const loadBtn = uploadSidebar.locator('#loadGistBtn');
    const status = uploadSidebar.locator('#uploadStatus');
    
    const gistInput = uploadSidebar.locator('#gistUrlInput');
    await gistInput.fill('invalid-url');
    await loadBtn.click();
    
    await expect(status).toHaveText('Invalid Gist URL format.');
  });

  test('should handle Gist with no JSON files', async ({ page }) => {
      const noJsonGistId = 'c724d78f175ebf8daa62761a138ff9aa';
      await page.route(`https://api.github.com/gists/${noJsonGistId}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: {
            'readme.md': { filename: 'readme.md', content: 'ignore me' }
          }
        })
      });
    });

    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const gistInput = uploadSidebar.locator('#gistUrlInput');
    const loadBtn = uploadSidebar.locator('#loadGistBtn');
    const status = uploadSidebar.locator('#uploadStatus');

    await gistInput.fill(`https://gist.github.com/${noJsonGistId}`);
    await loadBtn.click();

    await expect(status).toHaveText('No JSON files found in this Gist.');
  });
  
  test('should auto-load Gist from URL param', async ({ page }) => {
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
    await page.waitForLoadState('networkidle'); // Wait for all network requests to finish

    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const status = uploadSidebar.locator('#uploadStatus');
    
    await expect(status).toHaveText('1 valid JMH report(s) loaded.');
  });

  test('should remove gistId from URL when file is uploaded', async ({ page }) => {
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

    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const status = uploadSidebar.locator('#uploadStatus');
    await expect(status).toHaveText('1 valid JMH report(s) loaded.');
    expect(page.url()).toContain(`gistId=${autoLoadGistId}`);

    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'local.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "local", "primaryMetric": {"score": 20, "scoreUnit": "ns/op"}, "mode": "avgt"}]'
      ),
    });

    await expect(status).toHaveText('1 valid JMH report(s) loaded.');
    expect(page.url()).not.toContain('gistId=');
  });

  test('should allow closing sidebar after successful upload', async ({ page }) => {
    const uploadSidebar = page.locator('jrv-upload-sidebar');
    const closeButton = uploadSidebar.locator('#close-sidebar-btn');
    
    await expect(closeButton).toBeHidden();

    const fileInput = uploadSidebar.locator('#fileInput');
    await fileInput.setInputFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        '[{"benchmark": "test", "primaryMetric": {"score": 1}, "mode": "avgt"}]'
      ),
    });

    await expect(uploadSidebar).toHaveClass(/collapsed/);

    const hamburger = page.locator('jrv-menu-bar').locator('#hamburger-menu');
    await hamburger.click();
    await expect(uploadSidebar).not.toHaveClass(/collapsed/);

    await expect(closeButton).toBeVisible();

    await closeButton.click();
    await expect(uploadSidebar).toHaveClass(/collapsed/);
  });
});
