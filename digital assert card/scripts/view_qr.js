import { auth, db } from './firebase-config.js';
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {
    loadQRCodes();
    setupFilters();
});

async function loadQRCodes() {
    const user = auth.currentUser;
    if (!user) return;

    const qrCodesRef = collection(db, "qrcodes");
    const q = query(qrCodesRef, where("userId", "==", user.uid));
    
    try {
        const querySnapshot = await getDocs(q);
        const qrGrid = document.getElementById('qrCodesGrid');
        qrGrid.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const qrCard = createQRCard(doc.id, data);
            qrGrid.appendChild(qrCard);
        });
    } catch (error) {
        showToast('Error loading QR codes', 'error');
    }
}

function createQRCard(id, data) {
    const card = document.createElement('div');
    card.className = 'qr-card';
    card.innerHTML = `
        <div class="qr-image">
            <img src="${data.qrCodeUrl}" alt="QR Code">
        </div>
        <div class="qr-info">
            <h3>${data.assetType} - ${data.brandName}</h3>
            <p>Serial: ${data.serialNumber}</p>
            <p>Status: <span class="status ${data.status}">${data.status}</span></p>
        </div>
    `;

    card.addEventListener('click', () => showQRDetails(id, data));
    return card;
}

function showQRDetails(id, data) {
    const modal = document.getElementById('qrModal');
    const modalQrImage = document.getElementById('modalQrImage');
    const infoGrid = document.querySelector('.info-grid');

    modalQrImage.src = data.qrCodeUrl;
    infoGrid.innerHTML = Object.entries(data)
        .filter(([key]) => key !== 'qrCodeUrl' && key !== 'userId')
        .map(([key, value]) => `
            <div class="info-item">
                <span class="label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <span class="value">${value}</span>
            </div>
        `).join('');

    modal.style.display = 'block';
    
    // Setup modal actions
    document.getElementById('deleteBtn').onclick = () => deleteQRCode(id);
    document.getElementById('downloadBtn').onclick = () => downloadQR(data.qrCodeUrl);
    document.getElementById('printBtn').onclick = () => printQR(data.qrCodeUrl);
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');

    [searchInput, typeFilter, statusFilter].forEach(element => {
        element.addEventListener('change', loadQRCodes);
    });

    searchInput.addEventListener('input', debounce(loadQRCodes, 300));
}

// Helper functions for actions
function downloadQR(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr-code.png';
    link.click();
}

function printQR(url) {
    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print QR Code</title>
                <style>
                    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    img { max-width: 300px; }
                </style>
            </head>
            <body>
                <img src="${url}" />
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

async function deleteQRCode(id) {
    if (confirm('Are you sure you want to delete this QR code?')) {
        try {
            await deleteDoc(doc(db, "qrcodes", id));
            document.getElementById('qrModal').style.display = 'none';
            loadQRCodes();
            showToast('QR code deleted successfully', 'success');
        } catch (error) {
            showToast('Error deleting QR code', 'error');
        }
    }
}

// Add to existing JavaScript
let html5QrcodeScanner;

document.getElementById('cameraScanBtn').addEventListener('click', () => {
    const scannerContainer = document.getElementById('scannerContainer');
    scannerContainer.style.display = 'block';
    
    html5QrcodeScanner = new Html5Qrcode("reader");
    html5QrcodeScanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        },
        onScanSuccess,
        onScanError
    );
});

document.getElementById('fileScanBtn').addEventListener('click', () => {
    document.getElementById('qrFileInput').click();
});

document.getElementById('qrFileInput').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const qrcode = new Html5Qrcode("reader");
            qrcode.scanFile(file, true)
                .then(decodedText => {
                    onScanSuccess(decodedText);
                })
                .catch(err => {
                    showToast('Error scanning QR code', 'error');
                });
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('closeScannerBtn').addEventListener('click', () => {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            document.getElementById('scannerContainer').style.display = 'none';
        });
    }
});

function onScanSuccess(decodedText) {
    try {
        const assetData = JSON.parse(decodedText);
        showQRDetails(assetData.id, assetData);
        if (html5QrcodeScanner) {
            html5QrcodeScanner.stop();
            document.getElementById('scannerContainer').style.display = 'none';
        }
        showToast('QR Code scanned successfully!', 'success');
    } catch (error) {
        showToast('Invalid QR Code format', 'error');
    }
}

function onScanError(error) {
    console.warn(`Code scan error = ${error}`);
}
