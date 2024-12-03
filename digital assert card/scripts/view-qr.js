import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 });

html5QrcodeScanner.render(async (decodedText) => {
    try {
        const qrData = JSON.parse(decodedText);
        const qrDoc = await getDoc(doc(db, "qrcodes", qrData.id));
        
        if (qrDoc.exists()) {
            const data = qrDoc.data();
            document.getElementById('result').innerHTML = `
                <h3>${data.assetName}</h3>
                <p>${data.assetDescription}</p>
                <p>Created: ${new Date(data.createdAt).toLocaleDateString()}</p>
            `;
        }
    } catch (error) {
        document.getElementById('result').innerHTML = 'Invalid QR Code';
    }
});
