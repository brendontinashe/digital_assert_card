import { auth, db, storage } from './firebase-config.js';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

// Initialize tabs functionality
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Load user data when page loads
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            loadUserProfile(user.uid);
            loadActivityLog(user.uid);
        } else {
            window.location.href = 'login.html';
        }
    });
});

// Handle profile image upload
document.getElementById('imageUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    const storageRef = ref(storage, `profile-images/${user.uid}`);
    
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        await updateDoc(doc(db, "users", user.uid), {
            profilePicUrl: downloadURL
        });

        document.getElementById('profileImage').src = downloadURL;
        showToast('Profile picture updated successfully', 'success');
    } catch (error) {
        showToast('Failed to update profile picture', 'error');
    }
});

// Handle personal info form submission
document.getElementById('personalInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    try {
        await updateDoc(doc(db, "users", user.uid), {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            updatedAt: new Date().toISOString()
        });
        
        showToast('Profile updated successfully', 'success');
        loadUserProfile(user.uid); // Reload profile data
    } catch (error) {
        showToast('Failed to update profile', 'error');
    }
});

// Handle password change
document.getElementById('securityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        
        document.getElementById('securityForm').reset();
        showToast('Password updated successfully', 'success');
    } catch (error) {
        showToast('Failed to update password', 'error');
    }
});

// Load user profile data
async function loadUserProfile(userId) {
    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        const userData = userDoc.data();

        // Update profile card
        document.getElementById('displayName').textContent = userData.fullName;
        document.getElementById('displayEmail').textContent = userData.email;
        document.getElementById('displayStudentId').textContent = userData.studentId;
        
        if (userData.profilePicUrl) {
            document.getElementById('profileImage').src = userData.profilePicUrl;
        }

        // Update form fields
        document.getElementById('fullName').value = userData.fullName;
        document.getElementById('studentId').value = userData.studentId;
        document.getElementById('email').value = userData.email;
        document.getElementById('phone').value = userData.phone || '';

        // Calculate and display stats
        const daysSinceJoining = Math.floor((new Date() - new Date(userData.createdAt)) / (1000 * 60 * 60 * 24));
        document.getElementById('activeDays').textContent = daysSinceJoining;

        // Load total assets
        const assetsCount = await getTotalAssets(userId);
        document.getElementById('totalAssets').textContent = assetsCount;

    } catch (error) {
        showToast('Failed to load profile data', 'error');
    }
}

// Get total assets count
async function getTotalAssets(userId) {
    const q = query(collection(db, "qrcodes"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.size;
}

// Load activity log
async function loadActivityLog(userId) {
    try {
        const activityLog = document.getElementById('activityLog');
        activityLog.innerHTML = ''; // Clear existing content

        const q = query(
            collection(db, "activity"),
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const snapshot = await getDocs(q);
        
        snapshot.forEach(doc => {
            const activity = doc.data();
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <i class="fas ${getActivityIcon(activity.type)}"></i>
                <div class="activity-details">
                    <p>${activity.description}</p>
                    <span>${formatDate(activity.timestamp)}</span>
                </div>
            `;
            activityLog.appendChild(activityItem);
        });
    } catch (error) {
        showToast('Failed to load activity log', 'error');
    }
}

// Helper function to get activity icon
function getActivityIcon(type) {
    const icons = {
        'login': 'fa-sign-in-alt',
        'asset_created': 'fa-plus',
        'asset_updated': 'fa-edit',
        'asset_deleted': 'fa-trash',
        'profile_updated': 'fa-user-edit'
    };
    return icons[type] || 'fa-circle';
}

// Helper function to format date
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Toast notification function
function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}