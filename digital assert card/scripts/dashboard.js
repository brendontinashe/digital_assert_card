import { auth, db } from './firebase-config.js';
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await loadUserDashboard(user.uid);
            await loadStudentDetails(user.uid);
        } else {
            window.location.href = 'login.html';
        }
    });
});

async function loadUserDashboard(userId) {
    // Get asset cards count
    const cardsQuery = query(collection(db, "qrcodes"), where("userId", "==", userId));
    const cardsSnapshot = await getDocs(cardsQuery);
    const totalCards = cardsSnapshot.size;

    // Update stats
    document.querySelector('#totalCards').textContent = totalCards;
    
    // Load recent activity
    loadRecentActivity(userId);
}

// Get current user data and update header
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            updateHeaderWithUserData(user.uid);
        }
    });
});

async function updateHeaderWithUserData(userId) {
    const userDoc = await getDoc(doc(db, "users", userId));
    const userData = userDoc.data();

    // Update welcome message with actual user name
    document.querySelector('.user-name').textContent = userData.fullName;
    
    // Update profile section
    document.querySelector('.profile-info .user-name').textContent = userData.fullName;
    document.querySelector('.profile-info .user-role').textContent = userData.studentId;
    
    // Update profile image if exists
    if (userData.profilePicUrl) {
        const profileImages = document.querySelectorAll('.profile-pic');
        profileImages.forEach(img => {
            img.src = userData.profilePicUrl;
        });
    }

    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', options);
}
async function loadRecentActivity(userId) {
    const activityQuery = query(
        collection(db, "qrcodes"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(5)
    );

    const activitySnapshot = await getDocs(activityQuery);
    const activityList = document.querySelector('.activity-list');
    activityList.innerHTML = '';

    activitySnapshot.forEach(doc => {
        const data = doc.data();
        const activityHtml = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-qrcode"></i>
                </div>
                <div class="activity-details">
                    <h4>${data.assetName}</h4>
                    <p>${data.assetDescription}</p>
                    <span class="activity-time">${formatDate(data.createdAt)}</span>
                </div>
            </div>
        `;
        activityList.insertAdjacentHTML('beforeend', activityHtml);
    });
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) { // Less than 24 hours
        return `${Math.floor(diff / 3600000)} hours ago`;
    } else {
        return date.toLocaleDateString();
    }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
});