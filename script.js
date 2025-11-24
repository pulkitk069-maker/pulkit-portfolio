import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// ⚠️ YAHAN APNI FIREBASE KEY PASTE KARNA
const firebaseConfig = {
    apiKey: "AIzaSyCy6uOrEeDffvJxjXljV51174kJbE3ka2o",
    authDomain: "pulkit-portfolio-b4cdc.firebaseapp.com",
    projectId: "pulkit-portfolio-b4cdc",
    storageBucket: "pulkit-portfolio-b4cdc.firebasestorage.app",
    messagingSenderId: "834002089336",
    appId: "1:834002089336:web:d94866171ff0eb19a5848d",
    measurementId: "G-SMXZH47CCX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
logEvent(analytics, 'page_view');

// === 1. MUSIC PLAYER LOGIC ===
// Attach to window to make sure HTML button can find it
window.toggleMusic = function() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    const icon = btn.querySelector('i');

    if (music.paused) {
        music.play().catch(e => alert("Tap anywhere on screen first!")); 
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

// === 2. VISITOR COUNTER ===
async function updateCounter() {
    const counterEl = document.getElementById('viewCounter');
    if(!counterEl) return;
    
    const docRef = doc(db, "stats", "visits");
    try {
        await updateDoc(docRef, { count: increment(1) });
        const updatedSnap = await getDoc(docRef);
        counterEl.innerText = updatedSnap.data().count;
    } catch (error) {
        console.log("Initializing Counter...");
        // If document doesn't exist, create it
        try { await setDoc(docRef, { count: 1 }); counterEl.innerText = 1; } catch(e){}
    }
}

// === 3. TYPING ANIMATION ===
const words = ["Video Editor", "Gamer", "BCA Student", "Web Developer"];
let i = 0;
function typeWriter() {
    const element = document.querySelector('.type-text');
    if(!element) return;
    const text = words[i];
    let currentText = element.innerText;
    if (currentText.length < text.length) {
        element.innerText = text.substring(0, currentText.length + 1);
        setTimeout(typeWriter, 100);
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
        setTimeout(eraseText, 50);
    } else {
        i = (i + 1) % words.length;
        setTimeout(typeWriter, 500);
    }
}

// === 4. INITIALIZE ===
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();
    updateCounter();

    // Contact Form Logic
    const form = document.getElementById('contactForm');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "Sending..."; btn.disabled = true;

            try {
                await addDoc(collection(db, "messages"), {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    message: document.getElementById('message').value,
                    timestamp: new Date()
                });
                alert("Message Sent! ✅");
                form.reset();
            } catch (e) { 
                alert("Error sending message. Check internet connection."); 
                console.error(e);
            }
            btn.innerText = originalText; btn.disabled = false;
        });
    }
});
