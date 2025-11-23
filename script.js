// 1. Firebase Imports (Browser Ready)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Your Specific Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCy6uOrEeDffvJxjXljV51174kJbE3ka2o",
  authDomain: "pulkit-portfolio-b4cdc.firebaseapp.com",
  projectId: "pulkit-portfolio-b4cdc",
  storageBucket: "pulkit-portfolio-b4cdc.firebasestorage.app",
  messagingSenderId: "834002089336",
  appId: "1:834002089336:web:d94866171ff0eb19a5848d"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
        setTimeout(eraseText, 2000); // 2 second ruko text pura hone par
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
        i = (i + 1) % words.length; // Agla word
        setTimeout(typeWriter, 500);
    }
}

// 5. Contact Form Logic (Database Connection)
document.addEventListener('DOMContentLoaded', () => {
    // Start Typing Animation
    typeWriter();

    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Page reload roko
            
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            
            // Button loading state
            btn.innerText = "Sending...";
            btn.disabled = true;
            btn.style.opacity = "0.7";

            // Get Values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            try {
                // Send to Firebase
                await addDoc(collection(db, "messages"), {
                    name: name,
                    email: email,
                    message: message,
                    timestamp: new Date() // Time bhi note hoga
                });

                // Success
                alert("Message Sent Successfully! ✅ I will contact you soon.");
                form.reset(); // Form khali karo
            } catch (error) {
                // Error
                console.error("Error sending message:", error);
                alert("Error! Message nahi gaya. Shayad Database Rules set nahi hain?");
            }

            // Reset Button
            btn.innerText = originalText;
            btn.disabled = false;
            btn.style.opacity = "1";
        });
    }
});
