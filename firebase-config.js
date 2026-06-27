// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBe96l-zFoKeGV7iuzW1AOGTJrRS96MCSs",
  authDomain: "money-empire-server.firebaseapp.com",
  projectId: "money-empire-server",
  storageBucket: "money-empire-server.firebasestorage.app",
  messagingSenderId: "488996031863",
  appId: "1:488996031863:web:a7470bd86b8ddabfad2572",
  measurementId: "G-N8MG9P3S0T"
};

// Initialisiere Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportiere die Datenbank, damit dein Spiel sie nutzen kann
export const db = getFirestore(app);
