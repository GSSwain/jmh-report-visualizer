import './layout/jrv-header.ts';
import './layout/jrv-app-layout.ts';
import './jrv-main-content.ts';
import './jrv-size-warning-banner.ts';
import { JrvAppLayout } from './layout/jrv-app-layout.js';
import { JrvMainContent } from './jrv-main-content.js';
import { BenchmarkFile } from '../types.js';
import { EVENTS } from '../events.js';

class JrvApp extends HTMLElement {
    private allBenchmarkFiles: BenchmarkFile[] = [];
    private layout: JrvAppLayout | null = null;
    private mainContent: JrvMainContent | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.allBenchmarkFiles = [];
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
                    font-family: sans-serif;
                }
                .app-layout {
                    display: flex;
                    margin: auto;
                    max-width: 1200px;
                    flex-direction: column;
                }
                .main-content-wrapper {
                    flex-grow: 1;
                    padding: 20px;
                    overflow-y: auto;
                    height: 100vh;
                    position: relative;
                }
                @media (min-width: 768px) {
                    .app-layout {
                        flex-direction: row;
                    }
                }
            </style>
            <jrv-header></jrv-header>
            <jrv-app-layout></jrv-app-layout>
            <div class="app-layout">
                <div class="main-content-wrapper">
                    <jrv-size-warning-banner></jrv-size-warning-banner>
                    <jrv-main-content></jrv-main-content>
                </div>
            </div>
        `;
        }
    }

    cacheElements() {
        if (this.shadowRoot) {
            this.layout = this.shadowRoot.querySelector('jrv-app-layout');
            this.mainContent = this.shadowRoot.querySelector('jrv-main-content');
        }
    }

    setupEventListeners() {
        window.addEventListener(EVENTS.UPLOAD.FILES_PROCESSED, this.handleFilesProcessed.bind(this) as EventListener);
        window.addEventListener(EVENTS.SETTINGS.BENCHMARK_SELECTION_CHANGED, this.handleSelectionChange.bind(this));
        window.addEventListener(EVENTS.SETTINGS.SHOW_FQCN_CHANGED, () => this.renderAll());
        window.addEventListener(EVENTS.SETTINGS.SHOW_RESULTS_TABLE_CHANGED, (e: any) => {
            this.mainContent?.toggleResultsTable(e.detail.showResultsTable);
        });
        
        window.addEventListener(EVENTS.FILTERS.CHANGED, () => {
            const selectedBenchmarks = this.layout?.getSelectedBenchmarks() || [];
            const showClassName = this.layout?.getShowClassName() || false;
            this.mainContent?.renderCharts(this.allBenchmarkFiles, selectedBenchmarks, showClassName);
        });
    }

    handleFilesProcessed(event: CustomEvent) {
        this.allBenchmarkFiles = event.detail.allBenchmarkFiles;
        
        // Explicitly update layout to ensure settings sidebar is populated
        if (this.layout) {
            this.layout.handleFilesProcessed(this.allBenchmarkFiles);
        }

        this.mainContent?.show();
        this.mainContent?.resetParameterFilters();
        requestAnimationFrame(() => this.handleSelectionChange());
    }

    handleSelectionChange() {
        const selectedBenchmarks = this.layout?.getSelectedBenchmarks() || [];
        const benchmarkData = this.allBenchmarkFiles
            .flatMap((f) => f.data)
            .filter((d) => selectedBenchmarks.includes(d.benchmark));
            
        this.mainContent?.updateParameterFilters(benchmarkData);
        this.renderAll();
    }

    renderAll() {
        requestAnimationFrame(() => {
            const selectedBenchmarks = this.layout?.getSelectedBenchmarks() || [];
            const showClassName = this.layout?.getShowClassName() || false;
            this.mainContent?.renderContent(this.allBenchmarkFiles, selectedBenchmarks, showClassName);
        });
    }
}

customElements.define('jrv-app', JrvApp);
