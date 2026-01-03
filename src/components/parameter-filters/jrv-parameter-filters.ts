import { BenchmarkData, Filter } from '../../types.js';

export class JrvParameterFilters extends HTMLElement {
  private filtersContainer: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: none;
                }
                h3 {
                    text-align: center;
                    margin-bottom: 15px;
                }
                p {
                    font-size: 0.9em;
                    color: #666;
                    margin-top: 0;
                }
                .parameter-filters {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .control-set {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                label {
                    margin-bottom: 5px;
                    white-space: nowrap;
                }
            </style>
            <h3>Parameter Filters</h3>
            <p>Use the filters below to customize the data displayed in the charts. You can select multiple values for each parameter.</p>
            <div id="filters" class="parameter-filters"></div>
        `;

        this.filtersContainer = this.shadowRoot.getElementById('filters');
        this.filtersContainer?.addEventListener('change', () => {
            this.dispatchEvent(
                new CustomEvent('jrv:filters:changed', {
                    detail: {
                        filters: this.getFilters(),
                    },
                    bubbles: true,
                    composed: true
                })
            );
        });
    }
  }

  findVaryingParameters(data: BenchmarkData[]) {
    const varying = new Set<string>();
    if (!data || data.length < 2) return varying;
    const allParams = new Set(
      data.flatMap((d) => (d.params ? Object.keys(d.params) : []))
    );
    allParams.forEach((param) => {
      const uniqueValues = new Set(
        data.map((d) => d.params?.[param]).filter((v) => v !== undefined)
      );
      if (uniqueValues.size > 1) {
        varying.add(param);
      }
    });
    return varying;
  }

  reset() {
      if (this.filtersContainer) {
          this.filtersContainer.innerHTML = '';
      }
      this.style.display = 'none';
  }

  setData(benchmarkData: BenchmarkData[]) {
    const currentFilters = this.getFilters();
    const currentSelectionMap = new Map<string, Set<string>>();
    currentFilters.forEach(f => {
        currentSelectionMap.set(f.param, new Set(f.values));
    });

    if (this.filtersContainer) {
        this.filtersContainer.innerHTML = '';
    }
    const varying = this.findVaryingParameters(benchmarkData);

    if (varying.size === 0) {
      this.style.display = 'none';
      return;
    }

    this.style.display = 'block';
    varying.forEach((param) => {
      const controlSet = document.createElement('div');
      controlSet.className = 'control-set';
      const label = document.createElement('label');
      label.htmlFor = `param-${param}`;
      label.textContent = `${param}:`;
      const select = document.createElement('select');
      select.id = `param-${param}`;
      select.multiple = true;
      select.dataset.param = param;

      const values = [
        ...new Set(
          benchmarkData
            .map((d) => d.params?.[param])
            .filter((v) => v !== undefined)
        ),
      ].sort();

      const previousSelection = currentSelectionMap.get(param);

      values.forEach((v) => {
        const option = document.createElement('option');
        if (v) {
            option.value = v;
            option.textContent = v;
            
            if (previousSelection) {
                option.selected = previousSelection.has(String(v));
            } else {
                option.selected = true;
            }
            
            select.appendChild(option);
        }
      });

      controlSet.appendChild(label);
      controlSet.appendChild(select);
      this.filtersContainer?.appendChild(controlSet);
    });
  }

  getFilters(): Filter[] {
    if (!this.filtersContainer) return [];
    const filterControls = [
      ...this.filtersContainer.querySelectorAll('select'),
    ];
    return filterControls.map((select) => ({
      param: select.dataset.param || '',
      values: [...select.selectedOptions].map((o) => o.value),
    }));
  }
}

customElements.define('jrv-parameter-filters', JrvParameterFilters);
