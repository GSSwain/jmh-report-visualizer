export class JrvFileUploader extends HTMLElement {
  private fileInput: HTMLInputElement | null = null;
  private dropZone: HTMLElement | null = null;

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
            p { font-size: 0.9em; margin-bottom: 10px; text-align: center; }
            input[type="file"] { width: 100%; }
            .drop-zone {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 20px;
                transition: background-color 0.2s ease, border-color 0.2s ease;
            }
            .drop-zone.active {
                background-color: #e8f0fe;
                border-color: #337ab7;
            }
        </style>
        <div id="dropZone" class="drop-zone">
            <h3>Upload JMH Reports</h3>
            <p>Drag & drop files here or click to select.</p>
            <input type="file" id="fileInput" multiple accept=".json">
        </div>
      `;

      this.fileInput = this.shadowRoot.querySelector('#fileInput');
      this.dropZone = this.shadowRoot.querySelector('#dropZone');
      
      this.fileInput?.addEventListener('change', this.handleFileUpload.bind(this));
      
      this.dropZone?.addEventListener('dragover', this.handleDragOver.bind(this));
      this.dropZone?.addEventListener('dragleave', this.handleDragLeave.bind(this));
      this.dropZone?.addEventListener('drop', this.handleFileDrop.bind(this));
    }
  }
  
  reset() {
      if (this.fileInput) {
          this.fileInput.value = '';
      }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.dropZone?.classList.add('active');
  }

  handleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dropZone?.classList.remove('active');
  }

  async handleFileDrop(event: DragEvent) {
    event.preventDefault();
    this.dropZone?.classList.remove('active');
    if (!event.dataTransfer?.files) return;
    
    const files = await this.getFilesFromDataTransfer(event.dataTransfer.files);
    this.dispatchFiles(files);
  }

  async handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const files = await this.getFilesFromDataTransfer(target.files);
    this.dispatchFiles(files);
  }
  
  async getFilesFromDataTransfer(fileList: FileList) {
      const filePromises = Array.from(fileList).map(async (file) => ({
        fileName: file.name,
        content: await file.text(),
      }));
      return Promise.all(filePromises);
  }
  
  dispatchFiles(files: { fileName: string; content: string }[]) {
      this.dispatchEvent(new CustomEvent('jrv:upload:file-uploaded', {
          detail: { files, isGist: false },
          bubbles: true,
          composed: true
      }));
  }
}

customElements.define('jrv-file-uploader', JrvFileUploader);
