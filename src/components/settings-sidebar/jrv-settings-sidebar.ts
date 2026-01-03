import { getBenchmarkDisplayName } from '../../utils/utils.js';
import { JrvSidebar } from '../sidebar/jrv-sidebar.js';
import { BenchmarkFile } from '../../types.js';

export class JrvSettingsSidebar extends JrvSidebar {
  private benchmarkSelectContainer: HTMLElement | null = null;
  private showClassNameToggle: HTMLInputElement | null = null;
  private showResultsTableToggle: HTMLInputElement | null = null;
  private settingsContent: HTMLElement | null = null;
  private noDataMessage: HTMLElement | null = null;
  public allBenchmarkFiles: BenchmarkFile[] = [];

  constructor() {
    super();
    this.setAttribute('position', 'right');
    this.setAttribute('width', '300px');
    this.setAttribute('hidden', '');
  }

  connectedCallback() {
    super.connectedCallback();
    
    this.innerHTML = `
            <style>
                h3 {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .small-text {
                    font-size: 0.9em;
                    color: #666;
                    margin-top: 0;
                }
                #benchmarkSelectContainer {
                    display: flex;
                    flex-direction: column;
                    max-height: 150px;
                    overflow-y: auto;
                    padding: 5px;
                    border: 1px solid #eee;
                    border-radius: 3px;
                }
                label {
                    margin-bottom: 5px;
                    white-space: nowrap;
                    display: block;
                }
                #no-data-message {
                    text-align: center;
                    padding: 20px;
                }
                .hidden {
                    display: none;
                }
            </style>
            <div id="settings-content">
                <h3>Benchmarks</h3>
                <p class="small-text">Select the benchmarks to display.</p>
                <div id="benchmarkSelectContainer"></div>
                <hr>
                <h3>Display Options</h3>
                <label>
                    <input type="checkbox" id="showClassNameToggle"> Show Fully Qualified Class Name
                </label>
                <label>
                    <input type="checkbox" id="showResultsTableToggle"> Show Results Raw Data Table
                </label>
            </div>
            <div id="no-data-message" class="hidden">
                <p>Please upload JMH reports to see benchmarks and display options.</p>
            </div>
        `;

    this.benchmarkSelectContainer = this.querySelector(
      '#benchmarkSelectContainer'
    );
    this.showClassNameToggle = this.querySelector('#showClassNameToggle');
    this.showResultsTableToggle = this.querySelector('#showResultsTableToggle');
    this.settingsContent = this.querySelector('#settings-content');
    this.noDataMessage = this.querySelector('#no-data-message');

    this.benchmarkSelectContainer?.addEventListener('change', () =>
      this.dispatchEvent(new CustomEvent('jrv:settings:benchmark-selection-changed', { bubbles: true, composed: true }))
    );
    this.showClassNameToggle?.addEventListener('change', () =>
      this.dispatchEvent(new CustomEvent('jrv:settings:show-fqcn-changed', {
          detail: { showFullyQualifiedClassName: this.showClassNameToggle?.checked },
          bubbles: true,
          composed: true
      }))
    );
    this.showResultsTableToggle?.addEventListener('change', () => 
      this.dispatchEvent(new CustomEvent('jrv:settings:show-results-table-changed', {
          detail: { showResultsTable: this.showResultsTableToggle?.checked },
          bubbles: true,
          composed: true
      }))
    );

    this.shadowRoot
      ?.getElementById('close-sidebar-btn')
      ?.addEventListener('click', () => {
        this.toggleCollapsed();
      });
      
    this.updateContent();
  }

  setData(allBenchmarkFiles: BenchmarkFile[]) {
    this.allBenchmarkFiles = allBenchmarkFiles;
    this.updateContent();
  }

  updateContent() {
    if (this.allBenchmarkFiles.length > 0) {
      this.settingsContent?.classList.remove('hidden');
      this.noDataMessage?.classList.add('hidden');
      this.populateBenchmarkSelect();
    } else {
      this.settingsContent?.classList.add('hidden');
      this.noDataMessage?.classList.remove('hidden');
    }
  }

  populateBenchmarkSelect() {
    if (!this.benchmarkSelectContainer) return;
    const allNames = [
      ...new Set(
        this.allBenchmarkFiles.flatMap((f) => f.data).map((d) => d.benchmark)
      ),
    ].sort();
    this.benchmarkSelectContainer.innerHTML = allNames
      .map(
        (name) =>
          `<label><input type="checkbox" name="benchmark" value="${name}" checked> ${getBenchmarkDisplayName(name, false)}</label>`
      )
      .join('');
  }

  getSelectedBenchmarks() {
    if (!this.benchmarkSelectContainer) return [];
    return [
      ...this.benchmarkSelectContainer.querySelectorAll('input:checked'),
    ].map((i) => (i as HTMLInputElement).value);
  }

  getShowClassName() {
    return this.showClassNameToggle?.checked ?? false;
  }
}

customElements.define('jrv-settings-sidebar', JrvSettingsSidebar);
