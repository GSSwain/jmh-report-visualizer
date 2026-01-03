import { EVENTS } from '../../events.js';

export class JrvMenuBar extends HTMLElement {
  private hamburgerMenu: HTMLElement | null = null;
  private settingsButton: HTMLElement | null = null;

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
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 0; /* Don't block clicks on content */
                z-index: 1002; /* Higher than sidebar */
                pointer-events: none; /* Let clicks pass through */
            }
            #hamburger-menu, #settings-button {
                color: #ecf0f1;
                position: absolute;
                top: 0.70rem;
                background-color: #2c3e50;
                border: none;
                font-size: 1.875rem;
                cursor: pointer;
                width: 2.5rem;
                border-radius: 0.3125rem;
                pointer-events: auto; /* Re-enable clicks for buttons */
            }
            #hamburger-menu {
                left: 0.625rem;
            }
            #settings-button {
                right: 0.625rem;
            }
            .hidden {
                display: none;
            }
            @media (min-width: 768px) {
                #hamburger-menu, #settings-button {
                    font-size: 2.5rem;
                    width: 3.125rem;
                    top: 0.9375rem;
                }
                #hamburger-menu {
                    left: 0.9375rem;
                }
                #settings-button {
                    right: 0.9375rem;
                }
            }
        </style>
        <button id="hamburger-menu" class="hidden">&#9776;</button>
        <button id="settings-button" class="hidden">&#9881;</button>
      `;

      this.hamburgerMenu = this.shadowRoot.getElementById('hamburger-menu');
      this.settingsButton = this.shadowRoot.getElementById('settings-button');

      this.hamburgerMenu?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent(EVENTS.MENU.HAMBURGER_BUTTON_CLICKED, { bubbles: true, composed: true }));
      });

      this.settingsButton?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent(EVENTS.MENU.SETTINGS_BUTTON_CLICKED, { bubbles: true, composed: true }));
      });
    }
  }

  toggleHamburgerVisibility(visible: boolean) {
    this.hamburgerMenu?.classList.toggle('hidden', !visible);
  }

  toggleSettingsButtonVisibility(visible: boolean) {
    this.settingsButton?.classList.toggle('hidden', !visible);
  }
}

customElements.define('jrv-menu-bar', JrvMenuBar);
