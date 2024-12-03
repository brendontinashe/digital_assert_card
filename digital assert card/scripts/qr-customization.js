class QRCodeCustomizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.colorPicker = '#000000';
        this.logoUrl = '';
        this.size = 256;
    }

    initialize() {
        this.setupColorPicker();
        this.setupLogoUpload();
        this.setupSizeControls();
    }

    generateQR(data) {
        const qr = new QRCode(this.container, {
            text: data,
            width: this.size,
            height: this.size,
            colorDark: this.colorPicker,
            logo: this.logoUrl,
            logoWidth: this.size * 0.2,
            logoHeight: this.size * 0.2
        });
        return qr;
    }
}
