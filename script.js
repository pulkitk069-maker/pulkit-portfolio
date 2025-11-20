// Typing Animation Logic
const words = ["Student.", "Gamer.", "Video Editor.", "Tech Enthusiast."];
let i = 0;
let timer;

function typeWriter() {
    const element = document.querySelector('.typing-text');
    const text = words[i];
    let currentText = element.innerText;

    if (currentText.length < text.length) {
        element.innerText = text.substring(0, currentText.length + 1);
        timer = setTimeout(typeWriter, 100);
    } else {
        setTimeout(eraseText, 2000);
    }
}

function eraseText() {
    const element = document.querySelector('.typing-text');
    let currentText = element.innerText;

    if (currentText.length > 0) {
        element.innerText = currentText.substring(0, currentText.length - 1);
        timer = setTimeout(eraseText, 50);
    } else {
        i = (i + 1) % words.length;
        setTimeout(typeWriter, 500);
    }
}

// Start animation on load
window.onload = function() {
    typeWriter();
};
