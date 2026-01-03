import '../menu/jrv-menu-bar.js';
import '../upload/jrv-upload-sidebar.js';
import '../settings/jrv-settings-sidebar.js';
import { JrvUploadSidebar } from '../upload/jrv-upload-sidebar.js';
import { JrvSettingsSidebar } from '../settings/jrv-settings-sidebar.js';
import { JrvMenuBar } from '../menu/jrv-menu-bar.js';
import { BenchmarkFile } from '../../types.js';
import { EVENTS } from '../../events.js';

export class JrvAppLayout extends HTMLElement {
    private uploadSidebar: JrvUploadSidebar | null = null;
    private settingsSidebar: JrvSettingsSidebar | null = null;
    private menuBar: JrvMenuBar | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.cacheElements();
        this.setupEventListeners();
        this.initializeUI();
    }

    render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
            </style>
            
            <jrv-menu-bar></jrv-menu-bar>
            <jrv-settings-sidebar></jrv-settings-sidebar>
            <jrv-upload-sidebar></jrv-upload-sidebar>
        `;
        }
    }

    cacheElements() {
        if (this.shadowRoot) {
            this.uploadSidebar = this.shadowRoot.querySelector('jrv-upload-sidebar');
            this.settingsSidebar = this.shadowRoot.querySelector('jrv-settings-sidebar');
            this.menuBar = this.shadowRoot.querySelector('jrv-menu-bar');
        }
    }

    setupEventListeners() {
        this.addEventListener(EVENTS.MENU.HAMBURGER_BUTTON_CLICKED, () => this.toggleUploadSidebar());
        this.addEventListener(EVENTS.MENU.SETTINGS_BUTTON_CLICKED, () => this.settingsSidebar?.toggleCollapsed());

        this.uploadSidebar?.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'left') this.toggleHamburgerMenuVisibility();
        });
        
        this.settingsSidebar?.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'right') this.toggleSettingsButtonVisibility();
        });

        window.addEventListener(EVENTS.UPLOAD.FILES_PROCESSED, (e: any) => {
            this.handleFilesProcessed(e.detail.allBenchmarkFiles);
        });
    }

    initializeUI() {
        if (this.uploadSidebar) {
            this.uploadSidebar.setCollapsed(false);
            this.uploadSidebar.allowCollapse = false;
        }
        this.settingsSidebar?.setCollapsed(true);
        this.toggleHamburgerMenuVisibility();
        this.toggleSettingsButtonVisibility();
    }

    toggleHamburgerMenuVisibility() {
        if (this.menuBar && this.uploadSidebar) {
            this.menuBar.toggleHamburgerVisibility(this.uploadSidebar.classList.contains('collapsed'));
        }
    }

    toggleSettingsButtonVisibility() {
        if (!this.settingsSidebar || !this.menuBar) return;
        
        const buttonVisible = this.settingsSidebar.classList.contains('collapsed');
        this.menuBar.toggleSettingsButtonVisibility(buttonVisible);
        
        this.settingsSidebar.removeAttribute('hidden');
    }

    toggleUploadSidebar() {
        if (this.uploadSidebar) {
            if (this.uploadSidebar.allowCollapse) {
                this.uploadSidebar.toggleCollapsed();
            }
        }
    }

    handleFilesProcessed(files: BenchmarkFile[]) {
        if (this.settingsSidebar) {
            this.settingsSidebar.setData(files);
            this.settingsSidebar.setCollapsed(true);
            this.toggleSettingsButtonVisibility();
        }
    }

    getSelectedBenchmarks() {
        return this.settingsSidebar?.getSelectedBenchmarks() || [];
    }

    getShowClassName() {
        return this.settingsSidebar?.getShowClassName() || false;
    }
}

customElements.define('jrv-app-layout', JrvAppLayout);
