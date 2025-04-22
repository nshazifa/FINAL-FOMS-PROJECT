// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAhRHYzGgt7lB5qM2i9BCImf5mkXe9NKAw",
    authDomain: "food-order-managemen-system.firebaseapp.com",
    projectId: "food-order-managemen-system",
    storageBucket: "food-order-managemen-system.appspot.com",
    messagingSenderId: "664605370183",
    appId: "1:664605370183:web:f0e122cdf38545ea95ce62",
    measurementId: "G-4JFTVETFQB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, GoogleAuthProvider, signInWithPopup };

console.log("Firebase initialized", app);

