import { EVENTS } from '../../events.js';

export class JrvGistLoader extends HTMLElement {
  private gistUrlInput: HTMLInputElement | null = null;
  private loadGistBtn: HTMLButtonElement | null = null;

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
            p { font-size: 0.9em; margin-bottom: 10px; }
            input[type="text"] { width: 100%; margin-bottom: 10px; box-sizing: border-box; padding: 8px; }
            button { width: 100%; padding: 10px; border: none; background-color: #337ab7; color: white; cursor: pointer; border-radius: 4px; }
            button:hover { background-color: #286090; }
            button:disabled { background-color: #ccc; cursor: not-allowed; }
        </style>
        <h3>Load from GitHub Gist</h3>
        <p>Enter the URL of a public Gist containing JMH JSON files.</p>
        <input type="text" id="gistUrlInput" placeholder="https://gist.github.com/user/...">
        <button id="loadGistBtn">Load from Gist</button>
      `;

      this.gistUrlInput = this.shadowRoot.querySelector('#gistUrlInput');
      this.loadGistBtn = this.shadowRoot.querySelector('#loadGistBtn');
      this.loadGistBtn?.addEventListener('click', this.handleGistLoad.bind(this));
      
      this.gistUrlInput?.addEventListener('focus', () => {
          this.dispatchEvent(new CustomEvent(EVENTS.UPLOAD.GIST_INPUT_FOCUS, { bubbles: true, composed: true }));
      });
      this.gistUrlInput?.addEventListener('blur', () => {
          this.dispatchEvent(new CustomEvent(EVENTS.UPLOAD.GIST_INPUT_BLUR, { bubbles: true, composed: true }));
      });
    }
  }

  setGistUrl(url: string) {
      if (this.gistUrlInput) {
          this.gistUrlInput.value = url;
      }
  }
  
  reset() {
      if (this.gistUrlInput) {
          this.gistUrlInput.value = '';
      }
  }

  async handleGistLoad() {
    if (!this.gistUrlInput) return;
    
    const gistUrl = this.gistUrlInput.value.trim();
    if (!gistUrl) return;

    const gistUrlPattern = /^(https:\/\/gist\.github\.com\/([a-zA-Z0-9-]+\/)?([a-f0-9]+)|[a-f0-9]+)$/;
    
    if (!gistUrlPattern.test(gistUrl)) {
        this.dispatchStatus('Invalid Gist URL format.');
        return;
    }

    const parts = gistUrl.split('/');
    const gistId = parts[parts.length - 1];

    if (!gistId) {
      this.dispatchStatus('Invalid Gist URL.');
      return;
    }

    this.dispatchStatus('Loading from Gist...');
    
    if (this.loadGistBtn) this.loadGistBtn.disabled = true;

    try {
      const response = await window.fetch(`https://api.github.com/gists/${gistId}`);
      
      if (!response.ok) {
          throw new Error(response.status === 404 ? 'Gist not found' : 'Failed to fetch Gist');
      }
      
      const gistData = await response.json();
      
      if (!gistData.files) {
          throw new Error('Invalid Gist data format');
      }

      const files = Object.values(gistData.files)
        .filter((file: any) => file.filename && file.filename.endsWith('.json'))
        .map((file: any) => ({
          fileName: file.filename,
          content: file.content,
        }));

      if (files.length === 0) {
        this.dispatchStatus('No JSON files found in this Gist.');
      } else {
        this.dispatchEvent(new CustomEvent(EVENTS.UPLOAD.FILES_UPLOADED, {
            detail: { files, isGist: true },
            bubbles: true,
            composed: true
        }));
        
        const url = new URL(window.location.href);
        url.searchParams.set('gistId', gistId);
        window.history.pushState({}, '', url.toString());
      }
    } catch (error: any) {
      this.dispatchStatus(`Error loading Gist: ${error.message}`);
    } finally {
        if (this.loadGistBtn) this.loadGistBtn.disabled = false;
    }
  }

  dispatchStatus(message: string) {
      this.dispatchEvent(new CustomEvent(EVENTS.UPLOAD.STATUS_UPDATE, {
          detail: { message },
          bubbles: true,
          composed: true
      }));
  }
}

customElements.define('jrv-gist-loader', JrvGistLoader);
