// IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// --- CONFIG ---
const OPENROUTER_API_KEY = "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"; // <--- ⚠️ YAHAN KEY PASTE KARO
const SITE_URL = "https://pulkitk069-maker.github.io/pulkit-portfolio/";

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

// === VARIABLES ===
const synth = window.speechSynthesis;
let recognition;

// === 1. MUSIC PLAYER ===
window.toggleMusic = function() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    const icon = btn.querySelector('i');
    if (music.paused) {
        music.play().catch(e => alert("Please tap anywhere first!")); // Auto-play block fix
        btn.classList.add('playing');
        icon.classList.remove('fa-play'); icon.classList.add('fa-pause');
    } else {
        music.pause();
        btn.classList.remove('playing');
        icon.classList.remove('fa-pause'); icon.classList.add('fa-play');
    }
}

// === 2. VOICE RECOGNITION (UI CONTROLLED) ===
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN"; // Hindi/English mix support

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('live-transcript').innerText = `"${transcript}"`;
        
        // Wait 1 sec then close UI and send
        setTimeout(() => {
            stopVoice(); // UI Close
            document.getElementById('userInput').value = transcript;
            toggleChat(); // Chat open if closed
            sendMessage(); // Send to Mukuu
        }, 1000);
    };

    recognition.onerror = function(event) {
        document.getElementById('live-transcript').innerText = "Error. Try again.";
    };
}

window.toggleVoice = function() {
    if (!recognition) { alert("Use Chrome for Voice!"); return; }
    
    // Show UI
    document.getElementById('voice-overlay').style.display = 'flex';
    document.getElementById('live-transcript').innerText = "Listening...";
    recognition.start();
}

window.stopVoice = function() {
    document.getElementById('voice-overlay').style.display = 'none';
    recognition.stop();
}

// === 3. TEXT TO SPEECH (Mukuu Speaks) ===
function speakText(text) {
    if (synth.speaking) synth.cancel();
    // Emojis remove karo bolne se pehle
    const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF])/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1; utterance.pitch = 1.1;
    const voices = synth.getVoices();
    // Try to find a female/Google voice
    const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Female"));
    if (preferredVoice) utterance.voice = preferredVoice;
    synth.speak(utterance);
}

// === 4. CHATBOT LOGIC (SALES + MAHEK) ===
window.toggleChat = function() {
    const chat = document.getElementById('chat-widget');
    chat.style.display = (chat.style.display === "none" || chat.style.display === "") ? "flex" : "none";
}

window.sendMessage = async function() {
    const inputField = document.getElementById('userInput');
    const message = inputField.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    inputField.value = ""; inputField.disabled = true;
    const loadingId = addMessage("Thinking... 🐼", 'bot');

    // SYSTEM PROMPT LOGIC
    let systemPrompt = "";
    let isMahek = false;
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("mahek") || lowerMsg.includes("madam") || lowerMsg.includes("gf")) {
        isMahek = true;
        systemPrompt = `You are Mukuu 🐼. You are talking to Mahek (Pulkit's girlfriend/Madam ji).
        Tone: Very romantic, emotional, respectful and loving. Use ❤️, 🥺 emojis.
        Tell her Pulkit loves her the most.`;
    } else {
        systemPrompt = `You are Mukuu 🐼, Sales Assistant for Pulkit.
        GOAL: Sell Web Development Services.
        Pulkit makes: Portfolios, Business Sites, Landing Pages.
        Pricing: Affordable.
        Contact: Ask them to use the Contact Form.
        Keep answers short, professional but friendly. Use 🐼.`;
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "qwen/qwen-2.5-72b-instruct",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": message }
                ]
            })
        });

        const data = await response.json();
        let aiReply = data.choices[0].message.content;
        
        if (isMahek) aiReply = "Madam ji! 🥺❤️ " + aiReply;

        document.getElementById(loadingId).remove();
        addMessage(aiReply, 'bot');
        speakText(aiReply); // Mukuu bologi

    } catch (error) {
        console.error(error);
        document.getElementById(loadingId).innerText = "Server Error 🐼";
    }
    inputField.disabled = false; inputField.focus();
}

function addMessage(text, sender) {
    const chatBody = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div; // Return element to remove/update later
}
window.handleEnter = function(e) { if (e.key === 'Enter') sendMessage(); }

// === 5. COUNTER & TYPING ===
// ... (Typing logic aur Counter Logic same rahega jo pichle code mein tha) ...
// ... Copy paste from previous message for brevity if needed, or assume it's there ...
async function updateCounter() {
    const counterEl = document.getElementById('viewCounter');
    const docRef = doc(db, "stats", "visits");
    try {
        await updateDoc(docRef, { count: increment(1) });
        const updatedSnap = await getDoc(docRef);
        counterEl.innerText = updatedSnap.data().count;
    } catch (e) { console.log("Counter Init..."); }
}
document.addEventListener('DOMContentLoaded', () => {
    updateCounter();
    // Typing animation logic...
    const form = document.getElementById('contactForm');
    if(form) form.addEventListener('submit', async (e) => { /* Form logic same */ });
});
