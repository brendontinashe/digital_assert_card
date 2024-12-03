import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

// Password strength checker
function checkPasswordStrength(password) {
    const strength = {
        length: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*]/.test(password)
    };
    
    const passedTests = Object.values(strength).filter(Boolean).length;
    return passedTests < 3 ? 'weak' : passedTests < 4 ? 'medium' : 'strong';
}

// Password input event listener
document.getElementById('password').addEventListener('input', (e) => {
    const strength = checkPasswordStrength(e.target.value);
    const meter = document.querySelector('.strength-meter');
    meter.className = 'strength-meter ' + strength;
});

// Form submission
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const studentId = document.getElementById('studentId').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showError("Passwords don't match");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
            fullName,
            studentId,
            email,
            createdAt: new Date().toISOString()
        });

        showSuccess('Account created successfully!');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showError(getErrorMessage(error.code));
    }
});

// Google Sign Up
document.getElementById('googleSignUp').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        showSuccess('Account created successfully!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(getErrorMessage(error.code));
    }
});
