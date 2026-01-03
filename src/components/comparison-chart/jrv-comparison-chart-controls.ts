import { EVENTS } from '../../events.js';

export class JrvComparisonChartControls extends HTMLElement {
  private chartTypeSelect: HTMLSelectElement | null = null;
  private downloadChartBtn: HTMLButtonElement | null = null;
  private displayInsightsCheckbox: HTMLInputElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
            <style>
                .comparison-controls {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-top: 20px;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                    justify-content: space-between;
                    align-items: center;
                }
                .left-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .right-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .control-set {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                button {
                    padding: 8px 12px;
                    border: 1px solid #ccc;
                    background-color: #f0f0f0;
                    cursor: pointer;
                    border-radius: 4px;
                    height: 34px;
                    box-sizing: border-box;
                }
                button:hover {
                    background-color: #e0e0e0;
                }
                select {
                    height: 34px;
                    padding: 6px 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background-color: #fff;
                }
                label {
                    margin-bottom: 0;
                    white-space: nowrap;
                    cursor: pointer;
                }
                input[type="checkbox"] {
                    margin-right: 5px;
                }
            </style>
            <div class="comparison-controls">
                <div class="left-controls">
                    <label>
                        <input type="checkbox" id="displayInsights"> Display Insights
                    </label>
                </div>
                <div class="right-controls">
                    <div class="control-set">
                        <label for="chartType">Chart Type:</label>
                        <select id="chartType" class="chart-type-toggle">
                            <option value="column" selected>Column</option>
                            <option value="bar">Bar</option>
                            <option value="line">Line</option>
                        </select>
                    </div>
                    <button id="downloadChartBtn">Download</button>
                </div>
            </div>
        `;

        this.chartTypeSelect = this.shadowRoot.getElementById('chartType') as HTMLSelectElement;
        this.downloadChartBtn = this.shadowRoot.getElementById('downloadChartBtn') as HTMLButtonElement;
        this.displayInsightsCheckbox = this.shadowRoot.getElementById('displayInsights') as HTMLInputElement;

        const initialType = this.getAttribute('chart-type');
        if (initialType && this.chartTypeSelect) {
            this.chartTypeSelect.value = initialType;
        }

        this.chartTypeSelect?.addEventListener('change', () => {
            this.dispatchEvent(
                new CustomEvent(EVENTS.CHART.CHART_TYPE_CHANGED, {
                    detail: { chartType: this.chartTypeSelect?.value },
                    bubbles: true,
                    composed: true,
                })
            );
        });

        this.downloadChartBtn?.addEventListener('click', () => {
            this.dispatchEvent(
                new CustomEvent(EVENTS.CHART.DOWNLOAD_CLICKED, {
                    bubbles: true,
                    composed: true,
                })
            );
        });

        this.displayInsightsCheckbox?.addEventListener('change', () => {
            this.dispatchEvent(
                new CustomEvent(EVENTS.CHART.SHOW_INSIGHTS_CLICKED, {
                    detail: { showInsights: this.displayInsightsCheckbox?.checked },
                    bubbles: true,
                    composed: true
                })
            );
        });
    }
  }

  get chartType() {
    return this.chartTypeSelect?.value || 'column';
  }

  set chartType(value) {
    if (this.chartTypeSelect) {
      this.chartTypeSelect.value = value;
    } else {
      this.setAttribute('chart-type', value);
    }
  }
}

customElements.define('jrv-comparison-chart-controls', JrvComparisonChartControls);
