/* istanbul ignore file */
import { test as base, expect, Page } from '@playwright/test';
// @ts-ignore
import { addCoverageReport } from 'monocart-reporter';

const test = base.extend({
  page: async ({ page }: { page: Page }, use: (page: Page) => Promise<void>) => {
    try {
        await Promise.all([
            page.coverage.startJSCoverage({
                resetOnNavigation: false
            }),
            page.coverage.startCSSCoverage({
                resetOnNavigation: false
            })
        ]);
    } catch (e) {
        console.error('Failed to start coverage', e);
    }
    
    await use(page);
    
    try {
        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage()
        ]);
        
        const coverageList = [...(jsCoverage || []), ...(cssCoverage || [])];
        await addCoverageReport(coverageList, test.info());
    } catch (e) {
        // Ignore coverage errors if page is closed or other issues
        // console.error('Failed to stop coverage', e);
    }
  },
});

export { test, expect };
