// Import Firebase SDK (Ye phone/browser pe chalega bina Node.js ke)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- STEP: YAHAN APNI FIREBASE KEY PASTE KARO ---
// (Firebase Console -> Project Settings -> General -> Scroll Down -> Copy Config)
const firebaseConfig = {
    apiKey: "PASTE_API_KEY_HERE",
    authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_PROJECT_ID",
    storageBucket: "PASTE_PROJECT_ID.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. TYPING ANIMATION LOGIC
const words = ["Video Editor", "Gamer", "BCA Student", "Tech Enthusiast"];
let i = 0;
let timer;

function typeWriter() {
    const element = document.querySelector('.type-text');
    if(!element) return;
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
    const element = document.querySelector('.type-text');
    if(!element) return;
    let currentText = element.innerText;

    if (currentText.length > 0) {
        element.innerText = currentText.substring(0, currentText.length - 1);
        timer = setTimeout(eraseText, 50);
    } else {
        i = (i + 1) % words.length;
        setTimeout(typeWriter, 500);
    }
}

// 2. FIREBASE FORM SUBMIT LOGIC
document.addEventListener('DOMContentLoaded', () => {
    // Start Animation
    typeWriter();

    // Handle Form Submit
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Page refresh roko
            
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Sending...";
            btn.disabled = true;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            try {
                // Database mein save karo
                await addDoc(collection(db, "messages"), {
                    name: name,
                    email: email,
                    message: message,
                    timestamp: new Date()
                });
                alert("Message Sent Successfully! ✅");
                form.reset();
            } catch (error) {
                console.error("Error:", error);
                alert("Error sending message. Check Console or Firebase Rules.");
            }

            btn.innerText = originalText;
            btn.disabled = false;
        });
    }
});
