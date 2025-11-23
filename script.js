// 1. IMPORTS (Sab kuch ek saath import kiya)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// 2. CONFIG (Tumhari Keys)
const firebaseConfig = {
    apiKey: "AIzaSyCy6uOrEeDffvJxjXljV51174kJbE3ka2o",
    authDomain: "pulkit-portfolio-b4cdc.firebaseapp.com",
    projectId: "pulkit-portfolio-b4cdc",
    storageBucket: "pulkit-portfolio-b4cdc.firebasestorage.app",
    messagingSenderId: "834002089336",
    appId: "1:834002089336:web:d94866171ff0eb19a5848d",
    measurementId: "G-SMXZH47CCX"
};

// 3. INITIALIZE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Log Page View
logEvent(analytics, 'page_view');

// === 4. MUSIC PLAYER LOGIC ===
// Window object par function lagaya taki HTML se call ho sake
window.toggleMusic = function() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    const icon = btn.querySelector('i');

    if (music.paused) {
        music.play();
        btn.classList.add('playing');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        music.pause();
        btn.classList.remove('playing');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

// === 5. VISITOR COUNTER LOGIC ===
async function updateCounter() {
    const counterEl = document.getElementById('viewCounter');
    // Database mein 'stats' folder ke andar 'visits' file dhoondo
    const docRef = doc(db, "stats", "visits");

    try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Agar file hai, to count +1 karo
            await updateDoc(docRef, { count: increment(1) });
            // Naya count wapas screen par dikhao
            const updatedSnap = await getDoc(docRef);
            counterEl.innerText = updatedSnap.data().count;
        } else {
            // Agar file nahi hai (First time), to create karo 1 se
            await setDoc(docRef, { count: 1 });
            counterEl.innerText = 1;
        }
    } catch (error) {
        console.error("Counter Error:", error);
        counterEl.innerText = "Error"; // Agar rule galat ho
    }
}

// === 6. TYPING ANIMATION LOGIC ===
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

// === 7. MAIN STARTUP ===
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();      // Text Effect Start
    updateCounter();   // Counter Start

    // Form Logic
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
                await addDoc(collection(db, "messages"), {
                    name: name,
                    email: email,
                    message: message,
                    timestamp: new Date()
                });
                logEvent(analytics, 'form_submit', { user: name });
                alert("Message Sent! ✅");
                form.reset();
            } catch (error) {
                console.error(error);
                alert("Error sending message.");
            }

            btn.innerText = originalText;
            btn.disabled = false;
        });
    }
});
