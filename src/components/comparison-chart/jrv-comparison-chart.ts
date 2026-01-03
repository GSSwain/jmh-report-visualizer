import { getBenchmarkDisplayName } from '../../utils/utils.js';
import { chartTooltipHandler } from './chart-tooltip-utils.js';
import { BenchmarkData } from '../../types.js';
import { Chart, ChartConfiguration } from 'chart.js';

const CONTRASTING_COLORS = [
  '#a6cee3',
  '#1f78b4',
  '#b2df8a',
  '#33a02c',
  '#fb9a99',
  '#e31a1c',
  '#fdbf6f',
  '#ff7f00',
  '#cab2d6',
  '#6a3d9a',
  '#ffff99',
  '#b15928',
];

export class JrvComparisonChart extends HTMLElement {
  private chart: Chart | null = null;
  private colorIndex: number = 0;
  private canvas: HTMLCanvasElement | null = null;
  private tooltipEl: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.chart = null;
    this.colorIndex = 0;
  }

  getNextColor() {
    return CONTRASTING_COLORS[this.colorIndex++ % CONTRASTING_COLORS.length];
  }

  connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
            <style>
                .chart-container {
                    position: relative;
                    min-height: 400px;
                    width: 100%;
                }
                .chartjs-tooltip {
                    opacity: 0;
                    position: absolute;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border-radius: 3px;
                    padding: 10px;
                    pointer-events: none;
                    transition: opacity 0.1s ease;
                    z-index: 100;
                }
                .chartjs-tooltip .tooltip-label {
                    font-size: 0.9em;
                    margin-bottom: 5px;
                }
                .chartjs-tooltip .tooltip-score {
                    font-weight: bold;
                    font-size: 1.2em;
                }
            </style>
            <div class="chart-container">
                <canvas></canvas>
                <div class="chartjs-tooltip"></div>
            </div>
        `;
        this.canvas = this.shadowRoot.querySelector('canvas');
        this.tooltipEl = this.shadowRoot.querySelector('.chartjs-tooltip');

        // Expose for testing
        if ((window as any).JRV_TESTING) {
            (window as any).Jrv = {
                ...(window as any).Jrv,
                chartTooltipHandler: chartTooltipHandler
            };
        }
    }
  }

  renderChart(config: ChartConfiguration) {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.canvas) {
        this.chart = new Chart(this.canvas, config);
    }
  }

  toBase64Image() {
    return this.chart ? this.chart.toBase64Image() : null;
  }

  updateChart(filteredData: BenchmarkData[], chartType: string, title: string, showClassName: boolean, labelKeys: string[]) {
    this.colorIndex = 0;

    if (!this.canvas) return;

    if (!filteredData || filteredData.length === 0) {
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      const ctx = this.canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    const unit = filteredData[0].primaryMetric.scoreUnit;
    const benchmarks = [
      ...new Set(filteredData.map((d) => d.benchmark)),
    ].sort();

    const uniqueParamCombinations: any[] = [];
    filteredData.forEach((d) => {
      if (!d.params) return;
      const key = JSON.stringify(d.params);
      if (!uniqueParamCombinations.some((p) => JSON.stringify(p) === key)) {
        uniqueParamCombinations.push(d.params);
      }
    });

    let datasets: any[] = [];

    uniqueParamCombinations.forEach((params) => {
      const data = benchmarks.map(
        (b) =>
          filteredData.find(
            (d) =>
              d.benchmark === b &&
              JSON.stringify(d.params) === JSON.stringify(params)
          )?.primaryMetric.score ?? null
      );
      if (data.some((d) => d !== null)) {
        const color = this.getNextColor();
        const label = labelKeys
          .map((key) => `${key}=${params[key]}`)
          .join(', ');
        datasets.push({
          label,
          data,
          borderColor: color,
          backgroundColor: color,
          fill: false,
        });
      }
    });

    const options: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
        },
        tooltip: {
          enabled: false,
          position: 'nearest',
          external: (context: any) => {
              if (this.tooltipEl) {
                  chartTooltipHandler(context, this.tooltipEl);
              }
          },
        },
      },
      scales: {
        x: { title: { display: true, text: 'Benchmark' } },
        y: { title: { display: true, text: `Score (${unit})` } },
      },
    };

    if (chartType === 'column') {
      options.indexAxis = 'y';
      [options.scales.x.title.text, options.scales.y.title.text] = [
        options.scales.y.title.text,
        options.scales.x.title.text,
      ];
    } else {
      options.indexAxis = 'x';
    }

    this.renderChart({
      type: chartType === 'line' ? 'line' : 'bar',
      data: {
        labels: benchmarks.map((b) =>
          getBenchmarkDisplayName(b, showClassName)
        ),
        datasets,
      },
      options: options,
    });
  }
}

customElements.define('jrv-comparison-chart', JrvComparisonChart);
