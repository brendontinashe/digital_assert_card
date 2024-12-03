// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

// Screen Reader Announcements
const announcer = {
    announce(message) {
        const element = document.createElement('div');
        element.setAttribute('aria-live', 'polite');
        element.textContent = message;
        document.body.appendChild(element);
        setTimeout(() => element.remove(), 1000);
    }
};
