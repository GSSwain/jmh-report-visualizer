import { BenchmarkFile } from '../../types.js';
import './jrv-benchmark-selector.js';
import './jrv-display-options.js';
import { JrvBenchmarkSelector } from './jrv-benchmark-selector.js';
import { JrvDisplayOptions } from './jrv-display-options.js';

export class JrvSettingsPanel extends HTMLElement {
  private benchmarkSelector: JrvBenchmarkSelector | null = null;
  private displayOptions: JrvDisplayOptions | null = null;
  private settingsContent: HTMLElement | null = null;
  private noDataMessage: HTMLElement | null = null;
  public allBenchmarkFiles: BenchmarkFile[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
            .hidden { display: none; }
            #no-data-message { text-align: center; padding: 20px; }
        </style>
        <div id="settings-content">
            <jrv-benchmark-selector></jrv-benchmark-selector>
            <hr>
            <jrv-display-options></jrv-display-options>
        </div>
        <div id="no-data-message" class="hidden">
            <p>Please upload JMH reports to see benchmarks and display options.</p>
        </div>
      `;
      this.benchmarkSelector = this.shadowRoot.querySelector('jrv-benchmark-selector');
      this.displayOptions = this.shadowRoot.querySelector('jrv-display-options');
      this.settingsContent = this.shadowRoot.getElementById('settings-content');
      this.noDataMessage = this.shadowRoot.getElementById('no-data-message');
      this.updateContent();
    }
  }

  setData(allBenchmarkFiles: BenchmarkFile[]) {
    this.allBenchmarkFiles = allBenchmarkFiles;
    this.updateContent();
  }

  updateContent() {
    if (this.allBenchmarkFiles.length > 0) {
      this.settingsContent?.classList.remove('hidden');
      this.noDataMessage?.classList.add('hidden');
      const benchmarkData = this.allBenchmarkFiles.flatMap(f => f.data);
      this.benchmarkSelector?.setBenchmarks(benchmarkData);
    } else {
      this.settingsContent?.classList.add('hidden');
      this.noDataMessage?.classList.remove('hidden');
    }
  }

  getSelectedBenchmarks() {
    return this.benchmarkSelector?.getSelectedBenchmarks() || [];
  }

  getShowClassName() {
    return this.displayOptions?.getShowClassName() ?? false;
  }
}

customElements.define('jrv-settings-panel', JrvSettingsPanel);
