export class JrvSidebar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.renderBaseSidebar();
  }

  renderBaseSidebar() {
    const position = this.getAttribute('position') || 'left';
    const width = this.getAttribute('width') || '300px';
    const parsedWidth = parseInt(width);
    const collapsedOffset = parsedWidth + 40;

    if (this.shadowRoot) {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    width: ${width};
                    padding: 20px;
                    background-color: #f5f5f5;
                    height: 100vh;
                    position: fixed;
                    top: 0;
                    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                    transition: left 0.3s ease, right 0.3s ease, box-shadow 0.3s ease, visibility 0.3s ease;
                    z-index: 1001; /* Lower than menu bar */
                    overflow: hidden;
                }
                :host([position="left"]) {
                    left: 0;
                }
                :host([position="left"].collapsed) {
                    left: -${collapsedOffset}px;
                    box-shadow: none;
                    visibility: hidden;
                }
                :host([position="right"]) {
                    right: 0;
                    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
                }
                :host([position="right"].collapsed) {
                    right: -${collapsedOffset}px;
                    box-shadow: none;
                    visibility: hidden;
                }

                .scrollable-content {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding-top: 30px;
                    padding-bottom: 10px;
                }

                #close-sidebar-btn {
                    position: absolute;
                    top: 10px;
                    background: none;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: #333;
                    z-index: 1001;
                }
                :host([position="left"]) #close-sidebar-btn {
                    right: 10px;
                }
                :host([position="right"]) #close-sidebar-btn {
                    left: 10px;
                }
            </style>
            <button id="close-sidebar-btn">&times;</button>
            <div class="scrollable-content">
                <slot></slot>
            </div>
        `;
    }
  }

  toggleCollapsed() {
    this.classList.toggle('collapsed');
  }

  setCollapsed(isCollapsed: boolean) {
    if (isCollapsed) {
      this.classList.add('collapsed');
    } else {
      this.classList.remove('collapsed');
    }
  }
}

customElements.define('jrv-sidebar', JrvSidebar);
