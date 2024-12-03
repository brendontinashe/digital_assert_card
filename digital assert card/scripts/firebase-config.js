import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA4vj53Q5bpZAjqgo-R5D31jl-ZBnrfX20",
    authDomain: "digital-asset-card.firebaseapp.com",
    projectId: "digital-asset-card",
    storageBucket: "digital-asset-card.firebasestorage.app",
    messagingSenderId: "641621722416",
    appId: "1:641621722416:web:b78a4a5e92712e9c69b4f5",
    measurementId: "G-CVP95RXJT3"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
