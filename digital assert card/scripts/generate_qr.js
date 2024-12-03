import { auth, db, storage } from './firebase-config.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

// Add image preview functionality
document.getElementById('studentImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagePreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('assetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Show loading state
    const generateBtn = e.target.querySelector('button[type="submit"]');
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;

    try {
        // Clear previous QR code
        document.getElementById('qrCode').innerHTML = '';

        // Get form data
        const formData = {
            assetType: document.getElementById('assetType').value,
            brandName: document.getElementById('brandName').value,
            model: document.getElementById('model').value,
            serialNumber: document.getElementById('serialNumber').value,
            color: document.getElementById('color').value,
            additionalDetails: document.getElementById('additionalDetails').value,
            userId: user.uid,
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        // Generate unique QR code ID
        const qrCodeId = `${user.uid}_${Date.now()}`;

        // Generate QR Code
        new QRCode(document.getElementById('qrCode'), {
            text: JSON.stringify({
                id: qrCodeId,
                ...formData
            }),
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Save to Firestore
        await setDoc(doc(db, "qrcodes", qrCodeId), formData);

        // Enable download button
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('printBtn').disabled = false;

        // Show success message
        showToast('QR Code generated successfully!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to generate QR Code', 'error');
    } finally {
        // Reset button state
        generateBtn.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';
        generateBtn.disabled = false;
    }
});

// Helper function for toast messages
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
// Download QR Code
document.getElementById('downloadBtn').addEventListener('click', () => {
    const qrCanvas = document.querySelector('#qrCode canvas');
    const link = document.createElement('a');
    link.download = `asset-qr-${Date.now()}.png`;
    link.href = qrCanvas.toDataURL();
    link.click();
});

// Print QR Code
document.getElementById('printBtn').addEventListener('click', () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    const qrCanvas = document.querySelector('#qrCode canvas');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Print QR Code</title>
                <style>
                    body { 
                        display: flex; 
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    img {
                        max-width: 300px;
                    }
                </style>
            </head>
            <body>
                <img src="${qrCanvas.toDataURL()}" />
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
});