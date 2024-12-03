import { auth, db } from './firebase-config.js';
import { doc, addDoc, collection } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.getElementById('qrGeneratorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const assetName = document.getElementById('assetName').value;
    const assetDescription = document.getElementById('assetDescription').value;
    
    const qrData = {
        assetName,
        assetDescription,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
    };

    try {
        const docRef = await addDoc(collection(db, "qrcodes"), qrData);
        
        // Generate QR code
        const qr = qrcode(0, 'L');
        qr.addData(JSON.stringify({
            id: docRef.id,
            ...qrData
        }));
        qr.make();
        
        // Display QR code
        const qrDisplay = document.getElementById('qrCodeDisplay');
        qrDisplay.innerHTML = qr.createImgTag(5);
    } catch (error) {
        alert('Failed to generate QR code: ' + error.message);
    }
});
