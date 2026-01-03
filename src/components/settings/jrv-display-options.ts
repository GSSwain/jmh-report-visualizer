import { EVENTS } from '../../events.js';

export class JrvDisplayOptions extends HTMLElement {
  private showClassNameToggle: HTMLInputElement | null = null;
  private showResultsTableToggle: HTMLInputElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
            :host { display: block; }
            h3 { text-align: center; margin-bottom: 15px; margin-top: 0; }
            label {
                margin-bottom: 5px;
                white-space: nowrap;
                display: block;
            }
        </style>
        <h3>Display Options</h3>
        <label>
            <input type="checkbox" id="showClassNameToggle"> Show Fully Qualified Class Name
        </label>
        <label>
            <input type="checkbox" id="showResultsTableToggle"> Show Results Raw Data Table
        </label>
      `;
      this.showClassNameToggle = this.shadowRoot.querySelector('#showClassNameToggle');
      this.showResultsTableToggle = this.shadowRoot.querySelector('#showResultsTableToggle');

      this.showClassNameToggle?.addEventListener('change', () => {
        this.dispatchEvent(new CustomEvent(EVENTS.SETTINGS.SHOW_FQCN_CHANGED, {
            detail: { showFullyQualifiedClassName: this.showClassNameToggle?.checked },
            bubbles: true,
            composed: true
        }));
      });

      this.showResultsTableToggle?.addEventListener('change', () => {
        this.dispatchEvent(new CustomEvent(EVENTS.SETTINGS.SHOW_RESULTS_TABLE_CHANGED, {
            detail: { showResultsTable: this.showResultsTableToggle?.checked },
            bubbles: true,
            composed: true
        }));
      });
    }
  }

  getShowClassName() {
    return this.showClassNameToggle?.checked ?? false;
  }
}

customElements.define('jrv-display-options', JrvDisplayOptions);
