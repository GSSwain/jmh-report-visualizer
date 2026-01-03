import { getBenchmarkDisplayName } from '../../utils/utils.js';
import { BenchmarkFile } from '../../types.js';

export class JrvResultsDataTable extends HTMLElement {
  private dataTable: HTMLElement | null = null;
  private tableContainer: HTMLElement | null = null;
  private commonParametersContainer: HTMLElement | null = null;
  private commonParametersDiv: HTMLElement | null = null;
  private allBenchmarkFiles: BenchmarkFile[] = [];
  private selectedBenchmarks: string[] = [];
  private showClassName: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.allBenchmarkFiles = [];
    this.selectedBenchmarks = [];
    this.showClassName = false;
  }

  connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                :host(.hidden) {
                    display: none;
                }
                .table-container {
                    margin-top: 20px;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                h3 {
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 1.2em;
                    color: #333;
                }
                p.description {
                    font-size: 0.9em;
                    color: #666;
                    margin-bottom: 15px;
                    margin-top: 0;
                }
                #commonParametersContainer {
                    margin-bottom: 20px;
                    padding: 15px;
                    background-color: #f9f9f9;
                    border: 1px solid #eee;
                    border-radius: 5px;
                    display: none;
                }
                #commonParametersContainer h4 {
                    margin-top: 0;
                    margin-bottom: 5px;
                    font-size: 1.0em;
                }
                #commonParameters {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                .parameter-tag {
                    background-color: #e0e0e0;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 0.9em;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background-color: #f2f2f2;
                }
                .hidden {
                    display: none;
                }
            </style>
            <div class="table-container hidden">
                <h3>Raw Benchmark Data</h3>
                <p class="description">Detailed view of the benchmark results, including scores and parameters.</p>
                
                <div id="commonParametersContainer">
                    <h4>Common Parameters</h4>
                    <p class="description">Parameters that are identical across all displayed benchmarks.</p>
                    <div id="commonParameters"></div>
                </div>
                
                <table id="dataTable"></table>
            </div>
        `;
        this.dataTable = this.shadowRoot.getElementById('dataTable');
        this.tableContainer = this.shadowRoot.querySelector('.table-container');
        this.commonParametersContainer = this.shadowRoot.getElementById('commonParametersContainer');
        this.commonParametersDiv = this.shadowRoot.getElementById('commonParameters');
    }
  }

  setData(allBenchmarkFiles: BenchmarkFile[], selectedBenchmarks: string[], showClassName: boolean) {
    this.allBenchmarkFiles = allBenchmarkFiles;
    this.selectedBenchmarks = selectedBenchmarks;
    this.showClassName = showClassName;
    this.renderTable();
  }

  renderTable() {
    if (!this.tableContainer || !this.commonParametersDiv || !this.commonParametersContainer || !this.dataTable) return;

    let data = this.allBenchmarkFiles
      .flatMap((f) => f.data)
      .filter((d) => this.selectedBenchmarks.includes(d.benchmark));

    if (data.length === 0) {
      this.tableContainer.classList.add('hidden');
      return;
    }
    
    this.tableContainer.classList.remove('hidden');

    data.sort((a, b) => a.benchmark.localeCompare(b.benchmark));

    const allParamKeys = [
      ...new Set(data.flatMap((d) => Object.keys(d.params || {}))),
    ].sort();

    const commonParams: { key: string; value: string | undefined }[] = [];
    const varyingParams: string[] = [];

    allParamKeys.forEach(key => {
        const values = data.map(d => d.params?.[key]);
        const firstValue = values[0];
        const allSame = values.every(v => v === firstValue);
        
        if (allSame) {
            commonParams.push({ key, value: firstValue });
        } else {
            varyingParams.push(key);
        }
    });

    if (commonParams.length > 0) {
        this.commonParametersDiv.innerHTML = commonParams.map(p => 
            `<span class="parameter-tag"><strong>${p.key}:</strong> ${p.value}</span>`
        ).join('');
        this.commonParametersContainer.style.display = 'block';
    } else {
        this.commonParametersContainer.style.display = 'none';
    }

    const headers = ['Benchmark', ...varyingParams, 'Score', 'Unit', 'Mode'];
    const headerRow = `<thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>`;

    const bodyRows = data
      .map((d) => {
        const row = [
          getBenchmarkDisplayName(d.benchmark, this.showClassName),
          ...varyingParams.map((p) => d.params?.[p] || ''),
          d.primaryMetric.score,
          d.primaryMetric.scoreUnit,
          d.mode,
        ];
        return `<tr>${row.map((r) => `<td>${r}</td>`).join('')}</tr>`;
      })
      .join('');

    this.dataTable.innerHTML = `${headerRow}<tbody>${bodyRows}</tbody>`;
  }
}

customElements.define('jrv-results-data-table', JrvResultsDataTable);
