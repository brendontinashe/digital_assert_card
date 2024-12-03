let html5QrcodeScanner;

document.addEventListener('DOMContentLoaded', () => {
    startCamera();
    setupScanOptions();
});

function startCamera() {
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
    };

    html5QrcodeScanner = new Html5Qrcode("reader");
    html5QrcodeScanner.start(
        { facingMode: "environment" }, 
        config,
        onScanSuccess
    );
}

function onScanSuccess(decodedText) {
    try {
        const assetData = JSON.parse(decodedText);
        displayAssetDetails(assetData);
        // Optional: Play a success sound
        new Audio('assets/beep.mp3').play();
    } catch (error) {
        showToast('Valid QR Code Detected', 'success');
    }
}

function displayAssetDetails(data) {
    document.querySelector('.result-container').style.display = 'block';
    
    // Populate the data
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = data[key];
        }
    });
}
function setupScanOptions() {
    const scanBtns = document.querySelectorAll('.scan-btn');
    const fileInput = document.getElementById('qr-input-file');

    scanBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scanBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.dataset.mode === 'upload') {
                fileInput.click();
            }
        });
    });

    fileInput.addEventListener('change', handleFileUpload);
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            qrcode.decode(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}
