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

// Initialize Firebase
let app, db, analytics;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    analytics = getAnalytics(app);
    logEvent(analytics, 'page_view');
} catch (e) { console.error(e); }

// =========================================
// 🐼 MUKUU AI LOGIC (Connected to Replit)
// =========================================
const BACKEND_URL = "https://2c67aea7-44d9-4621-bc83-51525f211188-00-3sssjc3dhyafv.sisko.replit.dev/chat";
const synth = window.speechSynthesis;
let recognition;

window.toggleChat = function() {
    const chat = document.getElementById('chat-widget');
    chat.style.display = (chat.style.display === "none" || chat.style.display === "") ? "flex" : "none";
}

window.sendMessage = async function() {
    const inputField = document.getElementById('userInput');
    const message = inputField.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    inputField.value = ""; 
    inputField.disabled = true;
    const loadingDiv = addMessage("Thinking... 🐼", 'bot');

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "message": message })
        });

        const data = await response.json();
        loadingDiv.remove();
        addMessage(data.reply, 'bot');
        speakText(data.reply); // Voice Output

    } catch (error) {
        loadingDiv.remove();
        addMessage("Server Sleeping 😴 (Replit Run karo)", 'bot');
    }
    inputField.disabled = false; inputField.focus();
}

function addMessage(text, sender) {
    const chatBody = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    // Convert Links to clickable HTML
    const linkedText = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color:#00f3ff;text-decoration:underline;">Open Link</a>');
    div.innerHTML = linkedText;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
}

window.handleEnter = function(e) { if (e.key === 'Enter') sendMessage(); }

// === VOICE LOGIC ===
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";
    recognition.onresult = function(e) {
        const text = e.results[0][0].transcript;
        document.querySelector('.listening-text').innerText = `"${text}"`;
        setTimeout(() => {
            stopVoice();
            document.getElementById('userInput').value = text;
            if(document.getElementById('chat-widget').style.display === 'none') toggleChat();
            sendMessage();
        }, 1000);
    };
}

window.toggleVoice = function() {
    if (!recognition) { alert("Use Chrome!"); return; }
    document.getElementById('voice-overlay').style.display = 'flex';
    document.querySelector('.listening-text').innerText = "Listening...";
    recognition.start();
}
window.stopVoice = function() {
    document.getElementById('voice-overlay').style.display = 'none';
    recognition.stop();
}

function speakText(text) {
    if (synth.speaking) synth.cancel();
    // Clean text (remove emojis/links) for cleaner speech
    const cleanText = text.replace(/(https?:\/\/[^\s]+)/g, 'link').replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF])/g, '');
    const u = new SpeechSynthesisUtterance(cleanText);
    u.rate = 1; u.pitch = 1.1;
    const voices = synth.getVoices();
    const v = voices.find(v => v.name.includes("Google") || v.name.includes("Female"));
    if(v) u.voice = v;
    synth.speak(u);
}

// === MUSIC & UTILS ===
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

// === STARTUP ===
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
