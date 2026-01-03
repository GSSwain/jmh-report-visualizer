import { JrvSidebar } from '../sidebar/jrv-sidebar.js';
import './jrv-upload-panel.js';
import { EVENTS } from '../../events.js';

export class JrvUploadSidebar extends JrvSidebar {
  private _allowCollapse: boolean = false;

  constructor() {
    super();
    this.setAttribute('position', 'left');
    this.setAttribute('width', '300px');
    this._allowCollapse = false;
  }

  set allowCollapse(value: boolean) {
    this._allowCollapse = value;
    const closeButton = this.shadowRoot?.getElementById('close-sidebar-btn');
    if (closeButton) {
      closeButton.style.display = value ? 'block' : 'none';
    }
  }

  get allowCollapse(): boolean {
    return this._allowCollapse;
  }

  connectedCallback() {
    super.connectedCallback();
    this.innerHTML = `<jrv-upload-panel></jrv-upload-panel>`;

    const closeButton = this.shadowRoot?.getElementById('close-sidebar-btn');
    if (closeButton) {
      closeButton.style.display = 'none';
      closeButton.addEventListener('click', (e) => {
        if (this.allowCollapse) {
          this.toggleCollapsed();
        } else {
          e.stopPropagation();
        }
      });
    }

    this.addEventListener(EVENTS.UPLOAD.FILES_PROCESSED, () => {
        this.setCollapsed(true);
        this.allowCollapse = true;
    });
  }
}

customElements.define('jrv-upload-sidebar', JrvUploadSidebar);
