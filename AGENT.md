# JMH Report Visualizer - Agent Guidelines

This document provides context and guidelines for AI agents and code assistants working on the JMH Report Visualizer project.

## Project Overview

JMH Report Visualizer is a web-based tool for visualizing Java Microbenchmark Harness (JMH) JSON reports. It allows users to upload benchmark results and view them as interactive charts and tables.

### Tech Stack

*   **Language:** TypeScript / JavaScript (ESNext)
*   **Framework:** Vanilla Web Components (Custom Elements)
*   **Build Tool:** Parcel
*   **Testing:** Playwright
*   **Charting:** Chart.js
*   **Styling:** CSS (Shadow DOM encapsulated)

## Architecture

The application is built using standard Web Components.

*   **Prefix:** All custom elements must use the `jrv-` prefix (e.g., `jrv-app`, `jrv-menu`).
*   **Shadow DOM:** Components use Shadow DOM for style encapsulation.
*   **Communication:** Components communicate primarily through **Custom Events** that bubble up to the window or parent components.

### Key Components

*   `jrv-app`: The root component that orchestrates the application state and layout.
*   `jrv-app-layout`: Handles the main layout structure (header, sidebars, content area).
*   `jrv-upload-sidebar`: Manages file uploads and Gist loading.
*   `jrv-settings-sidebar`: Controls benchmark selection and display options.
*   `jrv-main-content`: Displays the charts and data tables.
*   `jrv-comparison-chart`: Wraps Chart.js to render benchmark data.

## Event Naming Convention

All custom events must follow the pattern: `jrv:<functionality>:<event-name>`

Examples:
*   `jrv:upload:files-processed`
*   `jrv:settings:benchmark-selection-changed`
*   `jrv:chart:chart-type-changed`
*   `jrv:filters:changed`

Events should be dispatched with `{ bubbles: true, composed: true }` to ensure they can be handled at the application root level.

## Testing Guidelines

*   **Framework:** Playwright is used for end-to-end and component testing.
*   **Event Testing:** Use `page.exposeFunction()` to reliably capture custom events in tests, rather than polling or `page.evaluate` promises which can be flaky.
*   **Selectors:** Prefer user-visible locators (text, role) or stable IDs.
*   **Coverage:** Maintain high test coverage (aiming for >80% branch coverage).

## Coding Standards

*   **Formatting:** Prettier is enforced.
*   **Linting:** ESLint is used for code quality.
*   **Type Safety:** TypeScript is used, but `any` is occasionally used in legacy parts or for complex Chart.js types. Prefer strict typing where possible.
*   **No Unnecessary Comments:** Code should be self-documenting. Avoid redundant comments.

## Common Tasks

### Adding a New Component

1.  Create the component file in the appropriate `src/components/` subdirectory.
2.  Define the class extending `HTMLElement`.
3.  Register the custom element using `customElements.define('jrv-component-name', ClassName)`.
4.  Implement `connectedCallback` for rendering and setup.
5.  Add a corresponding `.test.ts` file.

### Modifying State

State is generally managed by `jrv-app` and passed down to children via methods (e.g., `setData()`, `updateContent()`). Avoid complex internal state in leaf components if it affects the global view.
