# JMH Report Visualizer

A web-based tool for visualizing Java Microbenchmark Harness (JMH) reports. This tool allows you to easily compare benchmark results, analyze performance metrics, and gain insights into your code's performance.

## Features

*   **Upload & Visualize:** Drag and drop your JMH JSON report files or load them directly from a GitHub Gist.
*   **Interactive Charts:** View your benchmark results in interactive bar, line, or column charts.
*   **Comparison:** Compare multiple benchmark runs side-by-side to identify performance regressions or improvements.
*   **Filtering:** Filter results by benchmark name, and parameters to focus on specific data points.
*   **Insights:** Get automated insights into performance differences, including estimated time savings and throughput changes.
*   **Export:** Download charts as images for use in reports or presentations.

## Development

If you want to contribute or run the application locally for development purposes.

### Prerequisites

*   Node.js (v14 or higher)
*   npm (v6 or higher)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/gsswain/jmh-report-visualizer.git
    cd jmh-report-visualizer
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally (Parcel)

Start the development server with hot reloading:

```bash
npm start
```

The application will be available at `http://localhost:1234`.

### Building for Production

Build the application for production:

```bash
npm run build
```

The build artifacts will be in the `dist` directory.

## Docker

If you prefer to run the application as a containerized service.

### Build Docker Image

To build the Docker image (this will also run the build script):

```bash
npm run docker:build
```

### Run Docker Container

To run the Docker container on port 8080:

```bash
npm run docker:run
```

The application will be available at `http://localhost:8080/jmh-report-visualizer/`.

## Usage

1.  **Run your JMH benchmarks:** Execute your JMH benchmarks and output the results to a JSON file (e.g., using `-rf json`).
2.  **Open the Visualizer:** Open the application in your web browser.
3.  **Upload Reports:** Click "Upload JMH Reports" and select your JSON file(s), or enter a Gist URL.
4.  **Analyze:** Use the sidebar to select benchmarks, filter by parameters, and view the charts and insights.

**Note on Comparison Mode:** For the comparison features to work effectively, your JMH reports should contain benchmarks run with different parameter values. The tool identifies parameters that vary across the benchmark runs and provides filters for them. If all parameters are the same, the comparison and filtering capabilities will be limited.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
