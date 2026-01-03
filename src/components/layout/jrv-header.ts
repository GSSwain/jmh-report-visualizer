export class JrvHeader extends HTMLElement {
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
                    text-align: center;
                    background-color: #2c3e50;
                    color: #ecf0f1;
                    top: 0;
                    position: sticky;
                    z-index: 1000;
                }
                h1 {
                    margin: 0;
                    padding: 20px 0;
                    font-family: sans-serif;
                    font-size: 1.5rem;
                }
                @media (min-width: 768px) {
                    h1 {
                        padding: 40px 0;
                        font-size: 2rem;
                    }
                }
            </style>
            <h1>JMH Report Visualizer</h1>`;
        }
    }
}

customElements.define('jrv-header', JrvHeader);
