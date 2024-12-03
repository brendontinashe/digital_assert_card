import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

// Email/Password Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showSuccess('Login successful!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(getErrorMessage(error.code));
    }
});

// Google Sign In
document.getElementById('googleSignIn').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        showSuccess('Login successful!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(getErrorMessage(error.code));
    }
});

// Password Toggle
document.querySelector('.toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Error Handling
function getErrorMessage(code) {
    const messages = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Invalid password',
        'auth/invalid-email': 'Invalid email address',
        'auth/too-many-requests': 'Too many attempts. Try again later'
    };
    return messages[code] || 'An error occurred. Please try again';
}

// Toast Notifications
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
