# Contributing to JMH Report Visualizer

Thank you for your interest in contributing to the JMH Report Visualizer! We welcome contributions from everyone. By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on GitHub. When reporting a bug, please include:

*   A clear and descriptive title.
*   Steps to reproduce the issue.
*   Expected behavior vs. actual behavior.
*   Screenshots or error messages, if applicable.
*   Your environment (browser, OS, etc.).

### Suggesting Enhancements

We love hearing your ideas! If you have a suggestion for a new feature or improvement, please open an issue on GitHub. Describe your idea in detail and explain why it would be useful.

### Pull Requests

1.  **Fork the repository** and create your branch from `main`.
2.  **Install dependencies** using `npm install`.
3.  **Make your changes**. Ensure your code follows the project's coding style.
4.  **Run tests** using `npm test` to ensure your changes don't break existing functionality.
5.  **Add new tests** if you are adding new features or fixing bugs.
6.  **Commit your changes** with clear and descriptive commit messages.
7.  **Push your branch** to your fork.
8.  **Open a Pull Request** against the `main` branch.

### Coding Style

*   We use [Prettier](https://prettier.io/) for code formatting. Please run `npm run format` before committing your changes.
*   Follow standard JavaScript best practices.
*   Use meaningful variable and function names.
*   **Web Components:** All custom elements must use the `jrv-` prefix (e.g., `jrv-header`, `jrv-menu`). This ensures consistency and avoids naming collisions.

### Testing

We use [Playwright](https://playwright.dev/) for testing. Please ensure all tests pass before submitting your pull request.

```bash
npm test
```

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE).
