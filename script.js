import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// ⚠️ PASTE YOUR FIREBASE KEY HERE
const firebaseConfig = {
    apiKey: "AIzaSyCy6uOrEeDffvJxjXljV51174kJbE3ka2o",
    authDomain: "pulkit-portfolio-b4cdc.firebaseapp.com",
    projectId: "pulkit-portfolio-b4cdc",
    storageBucket: "pulkit-portfolio-b4cdc.firebasestorage.app",
    messagingSenderId: "834002089336",
    appId: "1:834002089336:web:d94866171ff0eb19a5848d",
    measurementId: "G-SMXZH47CCX"
};

let app, db, analytics;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    analytics = getAnalytics(app);
    logEvent(analytics, 'page_view');
} catch (e) { console.error(e); }

// === MUSIC PLAYER ===
window.toggleMusic = function() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    const icon = btn.querySelector('i');
    if (music.paused) {
        music.play().catch(e => alert("Tap screen first!"));
        btn.classList.add('playing');
        icon.className = 'fas fa-pause';
    } else {
        music.pause();
        btn.classList.remove('playing');
        icon.className = 'fas fa-play';
    }
}

// === VISITOR COUNTER ===
async function updateCounter() {
    if (!db) return;
    const counterEl = document.getElementById('viewCounter');
    const docRef = doc(db, "stats", "visits");
    try {
        await updateDoc(docRef, { count: increment(1) });
        const updatedSnap = await getDoc(docRef);
        counterEl.innerText = updatedSnap.data().count;
    } catch (e) { try { await setDoc(docRef, { count: 1 }); counterEl.innerText = 1; } catch(err){} }
}

// === TYPING ANIMATION ===
const words = ["Video Editor", "Gamer", "BCA Student", "Web Developer"];
let i = 0;
function typeWriter() {
    const el = document.querySelector('.type-text');
    if(!el) return;
    const text = words[i];
    let cur = el.innerText;
    if(cur.length < text.length) { el.innerText = text.substring(0, cur.length+1); setTimeout(typeWriter, 100); }
    else setTimeout(eraseText, 2000);
}
function eraseText() {
    const el = document.querySelector('.type-text');
    if(!el) return;
    let cur = el.innerText;
    if(cur.length > 0) { el.innerText = cur.substring(0, cur.length-1); setTimeout(eraseText, 50); }
    else { i = (i+1)%words.length; setTimeout(typeWriter, 500); }
}

// === INITIALIZE ===
document.addEventListener('DOMContentLoaded', () => {
    typeWriter();
    updateCounter();
    const form = document.getElementById('contactForm');
    if(form) form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        btn.innerText = "Sending..."; btn.disabled = true;
        try {
            await addDoc(collection(db, "messages"), { 
                name: document.getElementById('name').value, 
                email: document.getElementById('email').value, 
                message: document.getElementById('message').value, 
                timestamp: new Date() 
            });
            alert("Sent! ✅"); form.reset();
        } catch (e) { alert("Error"); }
        btn.innerText = "SEND MESSAGE 🚀"; btn.disabled = false;
    });
});
