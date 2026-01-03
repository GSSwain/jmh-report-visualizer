import { getBenchmarkDisplayName } from '../../utils/utils.js';
import { BenchmarkData } from '../../types.js';
import { EVENTS } from '../../events.js';

export class JrvBenchmarkSelector extends HTMLElement {
  private container: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
            :host { display: block; margin-bottom: 20px; }
            h3 { text-align: center; margin-bottom: 15px; margin-top: 0; }
            p { font-size: 0.9em; color: #666; margin-top: 0; margin-bottom: 10px; }
            #container {
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
        </style>
        <h3>Benchmarks</h3>
        <p>Select the benchmarks to display.</p>
        <div id="container"></div>
      `;
      this.container = this.shadowRoot.getElementById('container');
      this.container?.addEventListener('change', () => {
          this.dispatchEvent(new CustomEvent(EVENTS.SETTINGS.BENCHMARK_SELECTION_CHANGED, { bubbles: true, composed: true }));
      });
    }
  }

  setBenchmarks(data: BenchmarkData[]) {
    if (!this.container) return;
    const allNames = [...new Set(data.map((d) => d.benchmark))].sort();
    
    this.container.innerHTML = allNames
      .map(
        (name) =>
          `<label><input type="checkbox" name="benchmark" value="${name}" checked> ${getBenchmarkDisplayName(name, false)}</label>`
      )
      .join('');
  }

  getSelectedBenchmarks() {
    if (!this.container) return [];
    return [...this.container.querySelectorAll('input:checked')].map((i) => (i as HTMLInputElement).value);
  }
}

customElements.define('jrv-benchmark-selector', JrvBenchmarkSelector);
