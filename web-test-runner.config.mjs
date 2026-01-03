import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  files: ['**/*.test.js'],
  nodeResolve: true,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
  testRunnerHtml: testFramework => `
    <html>
      <head>
        <script type="module">
          // Manually import chai for assertions
          import * as chai from 'chai';
          window.expect = chai.expect;
        </script>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>
  `,
};