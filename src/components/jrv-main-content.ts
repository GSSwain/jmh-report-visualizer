import './parameter-filters/jrv-parameter-filters.ts';
import './results-data-table/jrv-results-data-table.ts';
import './benchmark-analysis/jrv-benchmark-analysis-card.ts';
import { JrvParameterFilters } from './parameter-filters/jrv-parameter-filters.js';
import { JrvResultsDataTable } from './results-data-table/jrv-results-data-table.js';
import { JrvBenchmarkAnalysisCard } from './benchmark-analysis/jrv-benchmark-analysis-card.js';
import { BenchmarkFile } from '../types.js';

export class JrvMainContent extends HTMLElement {
    private mainContent: HTMLElement | null = null;
    private parameterFilters: JrvParameterFilters | null = null;
    private chartsContainer: HTMLElement | null = null;
    private resultsDataTable: JrvResultsDataTable | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.cacheElements();
        this.setupEventListeners();
    }

    render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .hidden {
                    display: none;
                }
            </style>
            <div id="mainContent" class="hidden">
                <jrv-parameter-filters></jrv-parameter-filters>
                <div id="chartsContainer"></div>
                <jrv-results-data-table class="hidden"></jrv-results-data-table>
            </div>
        `;
        }
    }

    cacheElements() {
        if (this.shadowRoot) {
            this.mainContent = this.shadowRoot.getElementById('mainContent');
            this.parameterFilters = this.shadowRoot.querySelector('jrv-parameter-filters');
            this.chartsContainer = this.shadowRoot.getElementById('chartsContainer');
            this.resultsDataTable = this.shadowRoot.querySelector('jrv-results-data-table');
        }
    }

    setupEventListeners() {
        this.parameterFilters?.addEventListener('change', () => {
            this.dispatchEvent(new CustomEvent('jrv:filters:changed', { bubbles: true, composed: true }));
        });
    }

    show() {
        this.mainContent?.classList.remove('hidden');
    }

    resetParameterFilters() {
        this.parameterFilters?.reset();
    }

    updateParameterFilters(data: any) {
        this.parameterFilters?.setData(data);
    }

    getFilters() {
        return this.parameterFilters?.getFilters() || [];
    }

    renderContent(allBenchmarkFiles: BenchmarkFile[], selectedBenchmarks: string[], showClassName: boolean) {
        this.renderCharts(allBenchmarkFiles, selectedBenchmarks, showClassName);
        this.renderTable(allBenchmarkFiles, selectedBenchmarks, showClassName);
    }

    renderCharts(allBenchmarkFiles: BenchmarkFile[], selectedBenchmarks: string[], showClassName: boolean) {
        const chartStates = new Map();
        this.shadowRoot?.querySelectorAll('jrv-benchmark-analysis-card').forEach((chart) => {
            chartStates.set((chart as HTMLElement).dataset.mode, {
                chartType: (chart as HTMLElement).dataset.chartType || 'column',
            });
        });

        if (this.chartsContainer) {
            this.chartsContainer.innerHTML = '';
        }
        const benchmarkData = allBenchmarkFiles
            .flatMap((f) => f.data)
            .filter((d) => selectedBenchmarks.includes(d.benchmark));

        if (benchmarkData.length === 0) return;

        const filters = this.getFilters();
        const labelKeys = filters.map((f) => f.param);
        const modes = [...new Set(benchmarkData.map((d) => d.mode))];

        modes.forEach((mode) => {
            const chartGroup = document.createElement('jrv-benchmark-analysis-card') as JrvBenchmarkAnalysisCard;
            chartGroup.dataset.mode = mode;
            chartGroup.dataset.title = `Comparison Chart (${mode})`;
            const oldState = chartStates.get(mode);
            if (oldState) {
                chartGroup.dataset.chartType = oldState.chartType;
            }
            this.chartsContainer?.appendChild(chartGroup);
            chartGroup.setData(
                allBenchmarkFiles,
                selectedBenchmarks,
                filters,
                showClassName,
                labelKeys
            );
        });
    }

    renderTable(allBenchmarkFiles: BenchmarkFile[], selectedBenchmarks: string[], showClassName: boolean) {
        this.resultsDataTable?.setData(
            allBenchmarkFiles,
            selectedBenchmarks,
            showClassName
        );
    }

    toggleResultsTable(show: boolean) {
        this.resultsDataTable?.classList.toggle('hidden', !show);
    }
}

customElements.define('jrv-main-content', JrvMainContent);
