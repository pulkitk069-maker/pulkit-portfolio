// 1. Imports (Database + Analytics)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// 2. Configuration (Keys + Analytics ID)
const firebaseConfig = {
  apiKey: "AIzaSyCy6uOrEeDffvJxjXljV51174kJbE3ka2o",
  authDomain: "pulkit-portfolio-b4cdc.firebaseapp.com",
  projectId: "pulkit-portfolio-b4cdc",
  storageBucket: "pulkit-portfolio-b4cdc.firebasestorage.app",
  messagingSenderId: "834002089336",
  appId: "1:834002089336:web:d94866171ff0eb19a5848d",
  measurementId: "G-SMXZH47CCX"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Page View Track Karo
logEvent(analytics, 'page_view');

// 4. Typing Animation Logic
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

// 5. Contact Form Logic
document.addEventListener('DOMContentLoaded', () => {
    typeWriter(); // Start Animation

    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Sending...";
            btn.disabled = true;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            try {
                // Save to Database
                await addDoc(collection(db, "messages"), {
                    name: name,
                    email: email,
                    message: message,
                    timestamp: new Date()
                });

                // Analytics Event: Form Submitted
                logEvent(analytics, 'form_submit', { user: name });

                alert("Message Sent Successfully! ✅");
                form.reset();
            } catch (error) {
                console.error("Error:", error);
                alert("Error! Message nahi gaya.");
            }

            btn.innerText = originalText;
            btn.disabled = false;
        });
    }
});
