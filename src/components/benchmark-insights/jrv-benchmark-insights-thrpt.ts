import { getBenchmarkDisplayName } from '../../utils/utils.js';
import { BenchmarkData } from '../../types.js';

export class JrvBenchmarkInsightsThrpt extends HTMLElement {
  private normalizedData: any[] = [];
  private selectedBaselineIndex: number = -1;
  private labelKeys: string[] = [];
  private thrptTableBody: HTMLElement | null = null;
  private baselineSelectThrpt: HTMLSelectElement | null = null;
  private normalizedThrptTableBody: HTMLElement | null = null;

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
        .positive-diff {
            color: #28a745;
        }
        .negative-diff {
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
      
      <div id="thrptContainer" class="insights-container">
        <div class="header-row">
            <h3>Throughput Difference (Operations)</h3>
            <div class="baseline-selector">
                <label for="baselineSelectThrpt">Baseline:</label>
                <select id="baselineSelectThrpt"></select>
            </div>
        </div>
        <div class="wip-warning">
            <strong>⚠️</strong> These insights are experimental estimates. Please verify calculations for critical decisions.
        </div>
        <p class="note">Shows how many <strong>more</strong> (positive) or <strong>fewer</strong> (negative) operations can be performed compared to the baseline per unit of time.</p>
        <table>
          <thead>
            <tr>
              <th>Benchmark</th>
              <th>Processors</th>
              <th>Per Second</th>
              <th>Per Minute</th>
              <th>Per Hour</th>
              <th>Per Day</th>
            </tr>
          </thead>
          <tbody id="thrptTableBody"></tbody>
        </table>
      </div>

      <div id="normalizedThrptContainer" class="insights-container">
        <div class="header-row">
            <h3>Projected Normalized Throughput Difference per Core (Efficiency)</h3>
        </div>
        <div class="wip-warning">
            <strong>⚠️ Work in Progress:</strong> These insights are experimental estimates. Please verify calculations for critical decisions.
        </div>
        <p class="note">
            Shows throughput difference normalized to a single CPU core. Useful for comparing efficiency per core.
            <br>Calculation: <code>(Ops/s / Processors)</code> difference extrapolated to time units.
        </p>
        <table>
          <thead>
            <tr>
              <th>Benchmark</th>
              <th>Processors</th>
              <th>Per Second</th>
              <th>Per Minute</th>
              <th>Per Hour</th>
              <th>Per Day</th>
            </tr>
          </thead>
          <tbody id="normalizedThrptTableBody"></tbody>
        </table>
      </div>
    `;
    
        this.thrptTableBody = this.shadowRoot.getElementById('thrptTableBody');
        this.baselineSelectThrpt = this.shadowRoot.getElementById('baselineSelectThrpt') as HTMLSelectElement;
        this.normalizedThrptTableBody = this.shadowRoot.getElementById('normalizedThrptTableBody');

        this.baselineSelectThrpt?.addEventListener('change', (e) => {
            this.selectedBaselineIndex = parseInt((e.target as HTMLSelectElement).value, 10);
            this.renderTables();
        });
    }
  }

  toOpsPerSecond(value: number, unit: string) {
      switch (unit) {
          case 'ops/ns': return value * 1_000_000_000;
          case 'ops/us': return value * 1_000_000;
          case 'ops/ms': return value * 1_000;
          case 'ops/s': return value;
          default: return value;
      }
  }

  formatNumber(num: number) {
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
  }

  getProcessors(params: any) {
      if (!params) return 1;
      const keys = Object.keys(params);
      const procKey = keys.find(k => /^(processors|threads|cpu|cpus)$/i.test(k));
      if (procKey) {
          const val = parseInt(params[procKey], 10);
          return isNaN(val) ? 1 : val;
      }
      return 1;
  }

  updateData(data: BenchmarkData[], showClassName: boolean, labelKeys: string[]) {
      this.labelKeys = labelKeys || [];
      this.normalizedData = data.map((d, index) => {
          const opsPerSec = this.toOpsPerSecond(d.primaryMetric.score, d.primaryMetric.scoreUnit);
          const processors = this.getProcessors(d.params);
          return {
              index: index,
              name: getBenchmarkDisplayName(d.benchmark, showClassName),
              params: d.params,
              opsPerSec: opsPerSec,
              processors: processors,
              normalizedOpsPerSec: opsPerSec / processors
          };
      });

      const bestPerformerIndex = this.normalizedData.reduce((prevIdx, curr, currIdx, arr) => 
          arr[prevIdx].opsPerSec > curr.opsPerSec ? prevIdx : currIdx
      , 0);

      this.selectedBaselineIndex = bestPerformerIndex;
      this.populateBaselineSelect();
      this.renderTables();
  }

  populateBaselineSelect() {
      if (!this.baselineSelectThrpt) return;
      this.baselineSelectThrpt.innerHTML = this.normalizedData.map(item => {
          const paramStr = this.formatParamsText(item.params);
          const label = `${item.name} ${paramStr}`;
          return `<option value="${item.index}" ${item.index === this.selectedBaselineIndex ? 'selected' : ''}>${label}</option>`;
      }).join('');
  }

  renderTables() {
      if (this.selectedBaselineIndex === -1 || !this.normalizedData[this.selectedBaselineIndex]) return;
      const baselineItem = this.normalizedData[this.selectedBaselineIndex];

      if (this.thrptTableBody) {
          this.thrptTableBody.innerHTML = this.normalizedData.map(item => {
            const isBaseline = item.index === this.selectedBaselineIndex;
            const diffOps = item.opsPerSec - baselineItem.opsPerSec;
            return this.createRowHtml(item, isBaseline, diffOps, false);
          }).join('');
      }

      if (this.normalizedThrptTableBody) {
          this.normalizedThrptTableBody.innerHTML = this.normalizedData.map(item => {
            const isBaseline = item.index === this.selectedBaselineIndex;
            const diffOps = item.normalizedOpsPerSec - baselineItem.normalizedOpsPerSec;
            return this.createRowHtml(item, isBaseline, diffOps, true);
          }).join('');
      }
  }

  createRowHtml(item: any, isBaseline: boolean, diffOps: number, isNormalized: boolean) {
      const diffPerSec = diffOps;
      const diffPerMin = diffOps * 60;
      const diffPerHour = diffOps * 3600;
      const diffPerDay = diffOps * 86400;

      const cellClass = diffOps > 0 ? 'positive-diff' : (diffOps < 0 ? 'negative-diff' : '');
      const sign = diffOps > 0 ? '+' : ''; 

      const processorsValue = isNormalized ? 1 : item.processors;
      const processorsCell = `<td class="processors-col">${processorsValue}</td>`;

      return `
        <tr>
          <td>${item.name} ${this.formatParams(item.params)}</td>
          ${processorsCell}
          <td class="${cellClass}">${isBaseline ? '<span class="baseline">Baseline</span>' : `${sign}${this.formatNumber(diffPerSec)}`}</td>
          <td class="${cellClass}">${isBaseline ? '<span class="baseline">Baseline</span>' : `${sign}${this.formatNumber(diffPerMin)}`}</td>
          <td class="${cellClass}">${isBaseline ? '<span class="baseline">Baseline</span>' : `${sign}${this.formatNumber(diffPerHour)}`}</td>
          <td class="${cellClass}">${isBaseline ? '<span class="baseline">Baseline</span>' : `${sign}${this.formatNumber(diffPerDay)}`}</td>
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

customElements.define('jrv-benchmark-insights-thrpt', JrvBenchmarkInsightsThrpt);
