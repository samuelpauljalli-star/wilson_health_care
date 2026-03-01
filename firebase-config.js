// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, setDoc, query, orderBy, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getDatabase, ref, set, get, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCh5w0Vljp-7dV_Ui_8gTXj_WKF5TyEToA",
    authDomain: "wilson-health-care.firebaseapp.com",
    databaseURL: "https://wilson-health-care-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wilson-health-care",
    storageBucket: "wilson-health-care.firebasestorage.app",
    messagingSenderId: "60179173764",
    appId: "1:60179173764:web:adfda13ac51d1140a00dd1",
    measurementId: "G-KT8FX5KZEB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();

// Export Firebase services
export {
    app, analytics, auth, db, rtdb, provider,
    GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
    collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc, getDoc, query, orderBy, serverTimestamp, onSnapshot,
    ref, set, get, onValue, push, update, remove
};
