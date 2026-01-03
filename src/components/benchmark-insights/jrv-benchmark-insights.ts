import './jrv-benchmark-insights-avgt.ts';
import './jrv-benchmark-insights-thrpt.ts';
import { JrvBenchmarkInsightsAvgt } from './jrv-benchmark-insights-avgt.js';
import { JrvBenchmarkInsightsThrpt } from './jrv-benchmark-insights-thrpt.js';
import { BenchmarkData } from '../../types.js';

export class JrvBenchmarkInsights extends HTMLElement {
  private avgtInsights: JrvBenchmarkInsightsAvgt | null = null;
  private thrptInsights: JrvBenchmarkInsightsThrpt | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin-top: 1.25rem;
        }
        .hidden {
          display: none;
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
        h2 {
            margin-top: 0;
            margin-bottom: 0.625rem;
            font-size: 1.2em;
            color: #333;
            border-bottom: 0.0625rem solid #eee;
            padding-bottom: 0.625rem;
        }
        .description {
            color: #666;
            margin-bottom: 1.25rem;
            line-height: 1.5;
            font-size: 0.95em;
        }
      </style>
      <h2>Insights</h2>
      <p class="description">
          These insights provide estimated projections to help visualize the impact of performance differences at scale.
      </p>
      <jrv-benchmark-insights-avgt id="avgtInsights" class="hidden"></jrv-benchmark-insights-avgt>
      <jrv-benchmark-insights-thrpt id="thrptInsights" class="hidden"></jrv-benchmark-insights-thrpt>
    `;
    
        this.avgtInsights = this.shadowRoot.getElementById('avgtInsights') as JrvBenchmarkInsightsAvgt;
        this.thrptInsights = this.shadowRoot.getElementById('thrptInsights') as JrvBenchmarkInsightsThrpt;
    }
  }

  updateInsights(data: BenchmarkData[], showClassName: boolean, labelKeys: string[]) {
    if (!data || data.length < 2) {
        this.hideAll();
        return;
    }

    const mode = data[0].mode;

    if (mode === 'avgt') {
        this.avgtInsights?.updateData(data, showClassName, labelKeys);
        this.avgtInsights?.classList.remove('hidden');
        this.thrptInsights?.classList.add('hidden');
    } else if (mode === 'thrpt') {
        this.thrptInsights?.updateData(data, showClassName, labelKeys);
        this.thrptInsights?.classList.remove('hidden');
        this.avgtInsights?.classList.add('hidden');
    } else {
        this.hideAll();
    }
  }

  hideAll() {
      this.avgtInsights?.classList.add('hidden');
      this.thrptInsights?.classList.add('hidden');
  }
}

customElements.define('jrv-benchmark-insights', JrvBenchmarkInsights);
