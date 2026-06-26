// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBe96l-zFoKeGV7iuzW1AOGTJrRS96MCSs",
  authDomain: "money-empire-server.firebaseapp.com",
  projectId: "money-empire-server",
  storageBucket: "money-empire-server.firebasestorage.app",
  messagingSenderId: "488996031863",
  appId: "1:488996031863:web:a7470bd86b8ddabfad2572",
  measurementId: "G-N8MG9P3S0T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);