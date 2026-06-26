// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBe96l-zFoKeGV7iuzW1AOGTJrRS96MCSs",
  authDomain: "money-empire-server.firebaseapp.com",
  projectId: "money-empire-server",
  storageBucket: "money-empire-server.firebasestorage.app",
  messagingSenderId: "488996031863",
  appId: "1:488996031863:web:a7470bd86b8ddabfad2572"
};

// Initialisiere Firebase
const app = initializeApp(firebaseConfig);

// Exportiere die Datenbank (db), damit script.js darauf zugreifen kann
export const db = getFirestore(app);
