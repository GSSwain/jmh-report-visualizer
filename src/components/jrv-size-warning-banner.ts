export class JrvSizeWarningBanner extends HTMLElement {
    private messageElement: HTMLElement | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.checkScreenSize();
        window.addEventListener('resize', this.checkScreenSize.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.checkScreenSize.bind(this));
    }

    render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
            <style>
                @keyframes popIn {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                :host {
                    display: none;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: #fff3cd;
                    color: #856404;
                    padding: 1.25rem;
                    text-align: center;
                    border: 1px solid #ffeeba;
                    border-radius: 0.5rem;
                    box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.2);
                    z-index: 10000;
                    font-family: sans-serif;
                    width: 100%;
                    box-sizing: border-box;
                    animation: popIn 0.3s ease-out;
                }
            </style>
            <div id="message"></div>
        `;
            this.messageElement = this.shadowRoot.getElementById('message');
        }
    }

    checkScreenSize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isPortrait = height > width;
        
        let message = '';
        
        if (width < 660) {
            if (isMobile && isPortrait && height >= 660) {
                 message = 'Please rotate your device to landscape mode for a better experience.';
            } else {
                 message = 'The experience would be much better on a bigger device (width > 660px).';
            }
        }

        if (message && this.messageElement) {
            this.messageElement.textContent = message;
            this.style.display = 'block';
        } else {
            this.style.display = 'none';
        }
    }
}

customElements.define('jrv-size-warning-banner', JrvSizeWarningBanner);
