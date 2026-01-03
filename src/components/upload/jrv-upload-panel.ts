import './jrv-file-uploader.js';
import './jrv-gist-loader.js';
import { JrvGistLoader } from './jrv-gist-loader.js';
import { JrvFileUploader } from './jrv-file-uploader.js';
import { BenchmarkData, BenchmarkFile } from '../../types.js';
import { EVENTS } from '../../events.js';

const isValidJmhReport = (data: any): data is BenchmarkData[] =>
  Array.isArray(data) &&
  data.length > 0 &&
  data[0].benchmark &&
  data[0].primaryMetric;

export class JrvUploadPanel extends HTMLElement {
  private uploadStatus: HTMLElement | null = null;
  private gistLoader: JrvGistLoader | null = null;
  private fileUploader: JrvFileUploader | null = null;
  private gistLoadZone: HTMLElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = `
        <style>
            .upload-status { margin-top: 15px; font-weight: bold; text-align: center; }
            .upload-section {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                transition: background-color 0.2s ease, border-color 0.2s ease;
            }
            .upload-section.active {
                background-color: #e8f0fe;
                border-color: #337ab7;
            }
            #gistLoadZone {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 20px;
                transition: background-color 0.2s ease, border-color 0.2s ease;
            }
            #gistLoadZone.active {
                background-color: #e8f0fe;
                border-color: #337ab7;
            }
        </style>
        
        <jrv-file-uploader></jrv-file-uploader>
        
        <div id="gistLoadZone">
            <jrv-gist-loader></jrv-gist-loader>
        </div>
        
        <div id="uploadStatus" class="upload-status"></div>
      `;

      this.uploadStatus = this.shadowRoot.getElementById('uploadStatus');
      this.gistLoader = this.shadowRoot.querySelector('jrv-gist-loader');
      this.fileUploader = this.shadowRoot.querySelector('jrv-file-uploader');
      this.gistLoadZone = this.shadowRoot.getElementById('gistLoadZone');

      this.addEventListener(EVENTS.UPLOAD.FILES_UPLOADED, (e: any) => {
          this.processFiles(e.detail.files, !e.detail.isGist);
      });

      this.addEventListener(EVENTS.UPLOAD.STATUS_UPDATE, (e: any) => {
          if (this.uploadStatus) {
              this.uploadStatus.textContent = e.detail.message;
          }
      });
      
      this.addEventListener(EVENTS.UPLOAD.GIST_INPUT_FOCUS, () => {
          this.gistLoadZone?.classList.add('active');
      });
      
      this.addEventListener(EVENTS.UPLOAD.GIST_INPUT_BLUR, () => {
          this.gistLoadZone?.classList.remove('active');
      });

      const urlParams = new URLSearchParams(window.location.search);
      const gistId = urlParams.get('gistId');
      if (gistId && this.gistLoader) {
        this.gistLoader.setGistUrl(`https://gist.github.com/${gistId}`);
        (this.gistLoader as any).handleGistLoad();
      }
    }
  }

  processFiles(files: { fileName: string; content: string }[], isFileUpload: boolean) {
    if (!this.uploadStatus) return;
    let allBenchmarkFiles: BenchmarkFile[] = [];
    let validFiles = 0;
    this.uploadStatus.textContent = 'Validating files...';

    files.forEach((file) => {
      try {
        const data = JSON.parse(file.content);
        if (isValidJmhReport(data)) {
          allBenchmarkFiles.push({ fileName: file.fileName, data });
          validFiles++;
        }
      } catch {}
    });

    if (validFiles > 0) {
      this.uploadStatus.textContent = `${validFiles} valid JMH report(s) loaded.`;
      this.dispatchEvent(
        new CustomEvent(EVENTS.UPLOAD.FILES_PROCESSED, {
          detail: { allBenchmarkFiles },
          bubbles: true,
          composed: true
        })
      );

      if (isFileUpload) {
          const url = new URL(window.location.href);
          if (url.searchParams.has('gistId')) {
              url.searchParams.delete('gistId');
              window.history.pushState({}, '', url.toString());
          }
          if (this.gistLoader) this.gistLoader.reset();
      } else {
          if (this.fileUploader) this.fileUploader.reset();
      }

    } else {
      this.uploadStatus.textContent = 'No valid JMH report files were found.';
    }
  }
}

customElements.define('jrv-upload-panel', JrvUploadPanel);
