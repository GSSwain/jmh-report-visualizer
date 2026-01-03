import { getBenchmarkDisplayName } from '../../utils/utils.js';
import { BenchmarkData } from '../../types.js';

export class JrvBenchmarkInsightsAvgt extends HTMLElement {
  private normalizedData: any[] = [];
  private selectedBaselineIndex: number = -1;
  private labelKeys: string[] = [];
  private avgtTableBody: HTMLElement | null = null;
  private baselineSelectAvgt: HTMLSelectElement | null = null;
  private normalizedAvgtTableBody: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.normalizedData = [];
    this.selectedBaselineIndex = -1;
    this.labelKeys = [];
  }

  connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
        }
        .insights-container {
          background-color: #f9f9f9;
          border: 0.0625rem solid #eee;
          border-radius: 0.3125rem;
          padding: 0.9375rem;
          overflow-x: auto;
          margin-bottom: 1.25rem;
        }
        .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.625rem;
        }
        h3 {
          margin: 0;
          font-size: 1.1em;
          color: #333;
        }
        .baseline-selector {
            display: flex;
            align-items: center;
            gap: 0.625rem;
        }
        select {
            padding: 0.3125rem;
            border-radius: 0.25rem;
            border: 0.0625rem solid #ccc;
        }
        p.note {
          font-size: 0.9em;
          color: #666;
          margin-bottom: 0.9375rem;
          margin-top: 0.3125rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9em;
          min-width: 37.5rem;
        }
        th, td {
          padding: 0.5rem;
          text-align: right;
          border-bottom: 0.0625rem solid #ddd;
        }
        th:first-child, td:first-child {
          text-align: left;
        }
        th {
          background-color: #eee;
          font-weight: 600;
        }
        .baseline {
          color: #28a745;
          font-weight: bold;
          font-style: italic;
        }
        .negative-savings {
            color: #dc3545;
        }
        .processors-col {
            color: #666;
            font-size: 0.85em;
        }
        .wip-warning {
            background-color: #fff3cd;
            color: #856404;
            padding: 0.625rem;
            border: 0.0625rem solid #ffeeba;
            border-radius: 0.3125rem;
            margin-bottom: 0.9375rem;
            font-size: 0.9em;
            text-align: center;
        }
      </style>
      
      <div id="avgtContainer" class="insights-container">
        <div class="header-row">
            <h3>Projected Wall-Clock Time Savings</h3>
            <div class="baseline-selector">
                <label for="baselineSelectAvgt">Baseline:</label>
                <select id="baselineSelectAvgt"></select>
            </div>
        </div>
        <div class="wip-warning">
            <strong>⚠️</strong> These insights are experimental estimates. Please verify calculations for critical decisions.
        </div>
        <p class="note">Shows how much time you would save by switching to the baseline implementation at different scales (based on latency).</p>
        <table>
          <thead>
            <tr>
              <th>Benchmark</th>
              <th>Processors</th>
              <th>100k Ops/Day</th>
              <th>1M Ops/Day</th>
              <th>10M Ops/Day</th>
              <th>100M Ops/Day</th>
              <th>1B Ops/Day</th>
            </tr>
          </thead>
          <tbody id="avgtTableBody"></tbody>
        </table>
      </div>

      <div id="normalizedAvgtContainer" class="insights-container">
        <div class="header-row">
            <h3>Projected Normalized CPU Time Savings (Cost Efficiency)</h3>
        </div>
        <div class="wip-warning">
            <strong>⚠️ Work in Progress:</strong> These insights are experimental estimates. Please verify calculations for critical decisions.
        </div>
        <p class="note">
            Shows savings normalized to a single CPU core. Useful for estimating cloud cost savings where you pay for CPU-seconds.
            <br>Calculation: <code>(Latency * Processors)</code> difference extrapolated to volume.
        </p>
        <table>
          <thead>
            <tr>
              <th>Benchmark</th>
              <th>Processors</th>
              <th>100k Ops/Day</th>
              <th>1M Ops/Day</th>
              <th>10M Ops/Day</th>
              <th>100M Ops/Day</th>
              <th>1B Ops/Day</th>
            </tr>
          </thead>
          <tbody id="normalizedAvgtTableBody"></tbody>
        </table>
      </div>
    `;
    
        this.avgtTableBody = this.shadowRoot.getElementById('avgtTableBody');
        this.baselineSelectAvgt = this.shadowRoot.getElementById('baselineSelectAvgt') as HTMLSelectElement;
        this.normalizedAvgtTableBody = this.shadowRoot.getElementById('normalizedAvgtTableBody');

        this.baselineSelectAvgt?.addEventListener('change', (e) => {
            this.selectedBaselineIndex = parseInt((e.target as HTMLSelectElement).value, 10);
            this.renderTables();
        });
    }
  }

  toNanoseconds(value: number, unit: string) {
    switch (unit) {
      case 'ns/op': return value;
      case 'us/op': return value * 1000;
      case 'ms/op': return value * 1_000_000;
      case 's/op':  return value * 1_000_000_000;
      default: return value;
    }
  }

  formatDuration(ns: number) {
    if (ns === 0) return '0s';
    
    const absNs = Math.abs(ns);
    const ms = absNs / 1_000_000;
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    let text = '';
    if (days >= 1) text = `${days.toFixed(1)} days`;
    else if (hours >= 1) text = `${hours.toFixed(1)} hrs`;
    else if (minutes >= 1) text = `${minutes.toFixed(1)} min`;
    else if (seconds >= 1) text = `${seconds.toFixed(1)} s`;
    else if (ms >= 1) text = `${ms.toFixed(0)} ms`;
    else text = `${absNs.toFixed(0)} ns`;

    return ns < 0 ? `-${text}` : text;
  }

  getProcessors(params: any) {
      if (!params) return 1;
      const keys = Object.keys(params);
      const procKey = keys.find(k => /^(processors)$/i.test(k));
      if (procKey) {
          const val = parseInt(params[procKey], 10);
          return isNaN(val) ? 1 : val;
      }
      return 1;
  }

  updateData(data: BenchmarkData[], showClassName: boolean, labelKeys: string[]) {
      this.labelKeys = labelKeys || [];
      this.normalizedData = data.map((d, index) => {
        const scoreNs = this.toNanoseconds(d.primaryMetric.score, d.primaryMetric.scoreUnit);
        const processors = this.getProcessors(d.params);
        return {
          index: index,
          name: getBenchmarkDisplayName(d.benchmark, showClassName),
          params: d.params,
          scoreNs: scoreNs,
          processors: processors,
          normalizedCpuNs: scoreNs * processors
        };
      });

      const bestPerformerIndex = this.normalizedData.reduce((prevIdx, curr, currIdx, arr) => 
        arr[prevIdx].scoreNs < curr.scoreNs ? prevIdx : currIdx
      , 0);

      this.selectedBaselineIndex = bestPerformerIndex;
      this.populateBaselineSelect();
      this.renderTables();
  }

  populateBaselineSelect() {
      if (!this.baselineSelectAvgt) return;
      this.baselineSelectAvgt.innerHTML = this.normalizedData.map(item => {
          const paramStr = this.formatParamsText(item.params);
          const label = `${item.name} ${paramStr}`;
          return `<option value="${item.index}" ${item.index === this.selectedBaselineIndex ? 'selected' : ''}>${label}</option>`;
      }).join('');
  }

  renderTables() {
      if (this.selectedBaselineIndex === -1 || !this.normalizedData[this.selectedBaselineIndex]) return;
      const baselineItem = this.normalizedData[this.selectedBaselineIndex];

      if (this.avgtTableBody) {
          this.avgtTableBody.innerHTML = this.normalizedData.map(item => {
            const isBaseline = item.index === this.selectedBaselineIndex;
            const diffNs = item.scoreNs - baselineItem.scoreNs;
            return this.createRowHtml(item, isBaseline, diffNs, false);
          }).join('');
      }

      if (this.normalizedAvgtTableBody) {
          this.normalizedAvgtTableBody.innerHTML = this.normalizedData.map(item => {
            const isBaseline = item.index === this.selectedBaselineIndex;
            const diffNs = item.normalizedCpuNs - baselineItem.normalizedCpuNs;
            return this.createRowHtml(item, isBaseline, diffNs, true);
          }).join('');
      }
  }

  createRowHtml(item: any, isBaseline: boolean, diffNs: number, isNormalized: boolean) {
      const save100k = this.formatDuration(diffNs * 100_000);
      const save1M = this.formatDuration(diffNs * 1_000_000);
      const save10M = this.formatDuration(diffNs * 10_000_000);
      const save100M = this.formatDuration(diffNs * 100_000_000);
      const save1B = this.formatDuration(diffNs * 1_000_000_000);

      const cellClass = diffNs < 0 ? 'negative-savings' : '';
      
      const processorsValue = isNormalized ? 1 : item.processors;
      const processorsCell = `<td class="processors-col">${processorsValue}</td>`;

      return `
        <tr>
          <td>${item.name} ${this.formatParams(item.params)}</td>
          ${processorsCell}
          <td class="${cellClass}">${isBaseline ? '<span class="baseline">Baseline</span>' : save100k}</td>
          <td class="${cellClass}">${isBaseline ? '<span class="baseline">Baseline</span>' : save1M}</td>
          <td class="${cellClass}">${isBaseline ? '<span class="baseline">Baseline</span>' : save10M}</td>
          <td class="${cellClass}">${isBaseline ? '<span class="baseline">Baseline</span>' : save100M}</td>
          <td class="${cellClass}">${isBaseline ? '<span class="baseline">Baseline</span>' : save1B}</td>
        </tr>
      `;
  }

  formatParams(params: any) {
    if (!params || !this.labelKeys || this.labelKeys.length === 0) return '';
    const filteredEntries = Object.entries(params).filter(([key]) => this.labelKeys.includes(key));
    if (filteredEntries.length === 0) return '';
    return `<span style="color: #666; font-size: 0.85em;">(${filteredEntries.map(([k, v]) => `${k}=${v}`).join(', ')})</span>`;
  }

  formatParamsText(params: any) {
    if (!params || !this.labelKeys || this.labelKeys.length === 0) return '';
    const filteredEntries = Object.entries(params).filter(([key]) => this.labelKeys.includes(key));
    if (filteredEntries.length === 0) return '';
    return `(${filteredEntries.map(([k, v]) => `${k}=${v}`).join(', ')})`;
  }
}

customElements.define('jrv-benchmark-insights-avgt', JrvBenchmarkInsightsAvgt);
