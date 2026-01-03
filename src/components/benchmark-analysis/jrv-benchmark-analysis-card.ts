import '../comparison-chart/jrv-comparison-chart-controls.ts';
import '../comparison-chart/jrv-comparison-chart.ts';
import '../benchmark-insights/jrv-benchmark-insights.ts';
import { JrvComparisonChartControls } from '../comparison-chart/jrv-comparison-chart-controls.js';
import { JrvComparisonChart } from '../comparison-chart/jrv-comparison-chart.js';
import { JrvBenchmarkInsights } from '../benchmark-insights/jrv-benchmark-insights.js';
import { BenchmarkData, BenchmarkFile, Filter } from '../../types.js';
import { EVENTS } from '../../events.js';

export class JrvBenchmarkAnalysisCard extends HTMLElement {
  private benchmarkData: BenchmarkData[] = [];
  private allBenchmarkFiles: BenchmarkFile[] = [];
  private filters: Filter[] = [];
  private showInsights: boolean = false;
  private mode: string = '';
  private chartType: string = 'column';
  private controls: JrvComparisonChartControls | null = null;
  private chartComponent: JrvComparisonChart | null = null;
  private insightsComponent: JrvBenchmarkInsights | null = null;
  private selectedBenchmarks: string[] = [];
  private showClassName: boolean = false;
  private labelKeys: string[] = [];
  private filteredData: BenchmarkData[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.benchmarkData = [];
    this.allBenchmarkFiles = [];
    this.filters = [];
    this.showInsights = false;
  }

  connectedCallback() {
    this.mode = this.dataset.mode || '';
    this.title = this.dataset.title || '';
    this.chartType = this.dataset.chartType || 'column';

    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
            <style>
                .chart-wrapper {
                    background-color: #fff;
                    padding: 1.25rem;
                    border-radius: 0.3125rem;
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
                    margin-bottom: 1.25rem;
                    position: relative;
                }
                .hidden {
                    display: none;
                }
            </style>
            <div class="chart-wrapper">
                <h2>${this.title}</h2>
                <jrv-comparison-chart-controls chart-type="${this.chartType}"></jrv-comparison-chart-controls>
                <jrv-comparison-chart></jrv-comparison-chart>
                <jrv-benchmark-insights class="hidden"></jrv-benchmark-insights>
            </div>
        `;

        this.controls = this.shadowRoot.querySelector('jrv-comparison-chart-controls');
        this.chartComponent = this.shadowRoot.querySelector('jrv-comparison-chart');
        this.insightsComponent = this.shadowRoot.querySelector('jrv-benchmark-insights');

        this.addEventListener(EVENTS.CHART.CHART_TYPE_CHANGED, (e: any) => {
            this.chartType = e.detail.chartType;
            this.dataset.chartType = this.chartType;
            this.render();
        });

        this.addEventListener(EVENTS.CHART.DOWNLOAD_CLICKED, () => {
            const base64 = this.chartComponent?.toBase64Image();
            if (base64) {
                const a = document.createElement('a');
                a.href = base64;
                let filename = this.title
                    .replace(/[^a-z0-9]+/gi, '_')
                    .toLowerCase();
                
                if (filename.endsWith('_')) {
                    filename = filename.slice(0, -1);
                }
                a.download = `${filename}.png`;
                a.click();
            }
        });

        this.addEventListener(EVENTS.CHART.SHOW_INSIGHTS_CLICKED, (e: any) => {
            this.showInsights = e.detail.showInsights;
            if (this.showInsights) {
                this.insightsComponent?.classList.remove('hidden');
                this.updateInsights(); 
            } else {
                this.insightsComponent?.classList.add('hidden');
            }
        });
    }
  }

  setData(
    allBenchmarkFiles: BenchmarkFile[],
    selectedBenchmarks: string[],
    filters: Filter[],
    showClassName: boolean,
    labelKeys: string[]
  ) {
    this.allBenchmarkFiles = allBenchmarkFiles;
    this.selectedBenchmarks = selectedBenchmarks;
    this.filters = filters;
    this.showClassName = showClassName;
    this.labelKeys = labelKeys;

    this.benchmarkData = this.allBenchmarkFiles
      .flatMap((f) => f.data)
      .filter(
        (d) =>
          d.mode === this.mode && this.selectedBenchmarks.includes(d.benchmark)
      );

    this.render();
  }

  render() {
    let filteredData = this.benchmarkData;
    if (!filteredData || filteredData.length === 0) {
      this.chartComponent?.updateChart([], this.chartType, this.title, this.showClassName, this.labelKeys);
      this.insightsComponent?.updateInsights([], this.showClassName, this.labelKeys);
      return;
    }

    this.filters.forEach((f) => {
      filteredData = filteredData.filter(
        (d) => d.params && f.values.includes(String(d.params[f.param]))
      );
    });

    this.filteredData = filteredData;

    this.chartComponent?.updateChart(
      filteredData,
      this.chartType,
      this.title,
      this.showClassName,
      this.labelKeys
    );

    if (this.showInsights) {
        this.updateInsights();
    }
  }

  updateInsights() {
      if (this.filteredData) {
          this.insightsComponent?.updateInsights(this.filteredData, this.showClassName, this.labelKeys);
      }
  }
}

customElements.define('jrv-benchmark-analysis-card', JrvBenchmarkAnalysisCard);
