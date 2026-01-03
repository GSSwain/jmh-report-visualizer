import { JrvSidebar } from '../sidebar/jrv-sidebar.js';
import { BenchmarkFile } from '../../types.js';
import './jrv-settings-panel.js';
import { JrvSettingsPanel } from './jrv-settings-panel.js';
import { EVENTS } from '../../events.js';

export class JrvSettingsSidebar extends JrvSidebar {
  private settingsPanel: JrvSettingsPanel | null = null;

  constructor() {
    super();
    this.setAttribute('position', 'right');
    this.setAttribute('width', '300px');
    this.setAttribute('hidden', '');
  }

  connectedCallback() {
    super.connectedCallback();
    this.innerHTML = `
        <jrv-settings-panel></jrv-settings-panel>
    `;
    this.settingsPanel = this.querySelector('jrv-settings-panel');

    this.shadowRoot?.getElementById('close-sidebar-btn')?.addEventListener('click', () => {
        this.toggleCollapsed();
    });
  }

  setData(allBenchmarkFiles: BenchmarkFile[]) {
    this.settingsPanel?.setData(allBenchmarkFiles);
  }

  getSelectedBenchmarks() {
    return this.settingsPanel?.getSelectedBenchmarks() || [];
  }

  getShowClassName() {
    return this.settingsPanel?.getShowClassName() ?? false;
  }
}

customElements.define('jrv-settings-sidebar', JrvSettingsSidebar);
