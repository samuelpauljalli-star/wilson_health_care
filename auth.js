/**
 * auth.js — Wilson Health Care
 * Shared Firebase Google Authentication Module
 * Import this as <script type="module" src="auth.js"> in any page
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ── Firebase Config ──────────────────────────────────────────────────────────
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

// Avoid duplicate app initialization
const app = getApps().find(a => a.name === 'wilson-auth')
    || initializeApp(firebaseConfig, 'wilson-auth');

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ── Save / Update user doc in Firestore ──────────────────────────────────────
async function saveUserToFirestore(firebaseUser, extraData = {}) {
    if (!firebaseUser) return;
    try {
        const uid = firebaseUser.uid;
        const ref = doc(db, 'users', uid);
        const existing = (await getDoc(ref)).data() || {};

        const userData = {
            uid,
            displayName: firebaseUser.displayName || extraData.name || existing.displayName || '',
            email: firebaseUser.email || existing.email || '',
            phoneNumber: firebaseUser.phoneNumber || extraData.mobile || existing.phoneNumber || '',
            photoURL: firebaseUser.photoURL || existing.photoURL || '',
            provider: firebaseUser.providerData?.[0]?.providerId || 'password',
            providerData: (firebaseUser.providerData || []).map(p => ({ providerId: p.providerId })),
            lastLoginAt: Date.now(),
            // Preserve address fields from Firestore if already saved
            hno: extraData.hno || existing.hno || '',
            street: extraData.street || existing.street || '',
            landmark: extraData.landmark || existing.landmark || '',
            pincode: extraData.pincode || existing.pincode || '',
            district: extraData.district || existing.district || '',
            state: extraData.state || existing.state || '',
            country: extraData.country || existing.country || 'India',
            updatedAt: serverTimestamp()
        };

        await setDoc(ref, userData, { merge: true });
        console.log('[Auth] User synced to Firestore:', userData.email);
        return userData;
    } catch (err) {
        console.error('[Auth] Firestore sync error:', err);
    }
}

// ── Merge Firestore data into localStorage wilson-user ───────────────────────
async function mergeAndSaveLocal(firebaseUser) {
    const stored = JSON.parse(localStorage.getItem('wilson-user') || '{}');
    const merged = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || stored.name || '',
        email: firebaseUser.email || stored.email || '',
        mobile: firebaseUser.phoneNumber || stored.mobile || '',
        profilePic: firebaseUser.photoURL || stored.profilePic || '',
        provider: firebaseUser.providerData?.[0]?.providerId || 'password',
        // Preserve address fields already filled in
        hno: stored.hno || '',
        street: stored.street || '',
        landmark: stored.landmark || '',
        pincode: stored.pincode || '',
        district: stored.district || '',
        state: stored.state || '',
        country: stored.country || 'India'
    };
    localStorage.setItem('wilson-user', JSON.stringify(merged));

    // Try to pull address from Firestore
    try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) {
            const d = snap.data();
            ['hno', 'street', 'landmark', 'pincode', 'district', 'state', 'country'].forEach(k => {
                if (d[k]) merged[k] = d[k];
            });
            if (d.phoneNumber) merged.mobile = d.phoneNumber;
            localStorage.setItem('wilson-user', JSON.stringify(merged));
        }
    } catch (_) { }

    return merged;
}

// ── Inject Google Sign-In Modal UI ───────────────────────────────────────────
function injectAuthModal() {
    if (document.getElementById('wilson-auth-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'wilson-auth-modal';
    modal.style.cssText = `
        display:none; position:fixed; inset:0; z-index:99999;
        background:rgba(0,0,0,0.6); backdrop-filter:blur(6px);
        align-items:center; justify-content:center;
    `;
    modal.innerHTML = `
        <div id="wilson-auth-card" style="
            background:#fff; border-radius:20px; padding:2.5rem 2rem;
            max-width:420px; width:92%; box-shadow:0 25px 60px rgba(0,0,0,0.3);
            animation: authSlideIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
            position:relative;
        ">
            <button onclick="window.closeAuthModal()" style="
                position:absolute; top:15px; right:18px; background:none; border:none;
                font-size:1.4rem; cursor:pointer; color:#94a3b8; line-height:1;
            ">&times;</button>

            <div style="text-align:center; margin-bottom:1.5rem;">
                <img src="logo.jpg" alt="Wilson" style="height:50px; border-radius:50%; margin-bottom:0.5rem;"
                     onerror="this.style.display='none'">
                <h2 style="color:#134e4a; font-size:1.4rem; font-weight:700;">Wilson Health Care</h2>
                <p style="color:#64748b; font-size:0.88rem; margin-top:4px;">Sign in to continue shopping</p>
            </div>

            <!-- Google Sign In -->
            <button id="wilson-google-btn" onclick="window.wilsonSignInWithGoogle()" style="
                width:100%; padding:1rem; border:2px solid #e2e8f0; border-radius:15px;
                background:#fff; display:flex; align-items:center; justify-content:center;
                gap:12px; cursor:pointer; font-size:1rem; font-weight:700; color:#374151;
                transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-bottom:1.2rem;
            " onmouseover="this.style.background='#f8fafc'; this.style.borderColor='#059669'; this.style.transform='translateY(-2px)';"
               onmouseout="this.style.background='#fff'; this.style.borderColor='#e2e8f0'; this.style.transform='';">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pwa_brand/google__72dp.png"
                     style="width:24px; height:24px;">
                Continue with Google
            </button>

            <p style="font-size:0.75rem; color:#94a3b8; text-align:center; margin-top:1.5rem; line-height:1.4;">
                By continuing, you verify that you are authorized to access this portal and agree to our terms.
            </p>
        </div>
        <style>
            @keyframes authSlideIn {
                from { transform: scale(0.8) translateY(30px); opacity:0; }
                to   { transform: scale(1) translateY(0); opacity:1; }
            }
        </style>
    `;
    document.body.appendChild(modal);
}

// ── Update any nav user button ───────────────────────────────────────────────
function updateNavUI(user) {
    // Update any element with id="login-nav-btn" or class "wilson-user-btn"
    const navBtn = document.getElementById('login-nav-btn');
    if (navBtn) {
        if (user) {
            if (user.photoURL) {
                navBtn.innerHTML = `<img src="${user.photoURL}" style="width:30px;height:30px;border-radius:50%;border:2px solid #059669;object-fit:cover;" onerror="this.outerHTML='<i class=\\'fas fa-user-check\\'></i>'">`;
            } else {
                navBtn.innerHTML = `<i class="fas fa-user-check" style="color:#059669;"></i>`;
            }
        } else {
            navBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
            navBtn.style.color = '';
        }
    }
}

// ── Public API ────────────────────────────────────────────────────────────────

window.openAuthModal = function () {
    injectAuthModal();
    const m = document.getElementById('wilson-auth-modal');
    m.style.display = 'flex';
    setTimeout(() => document.getElementById('wilson-auth-email')?.focus(), 100);
};

window.closeAuthModal = function () {
    const m = document.getElementById('wilson-auth-modal');
    if (m) m.style.display = 'none';
};

window.wilsonSignInWithGoogle = async function () {
    const btn = document.getElementById('wilson-google-btn');
    if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...'; btn.disabled = true; }
    try {
        const result = await signInWithPopup(auth, googleProvider);
        // onAuthStateChanged will handle the rest
        window.closeAuthModal();
    } catch (err) {
        console.error('[Auth] Google sign-in error:', err);
        showAuthError(err.code === 'auth/popup-closed-by-user'
            ? 'Sign-in cancelled.'
            : 'Google sign-in failed. Please try again.');
        if (btn) { btn.innerHTML = '<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pwa_brand/google__72dp.png" style="width:22px;"> Continue with Google'; btn.disabled = false; }
    }
};

// wilsonSignInWithEmail removed as requested (Google login only)

window.wilsonSignOut = async function () {
    try {
        await signOut(auth);
        localStorage.removeItem('wilson-user');
        updateNavUI(null);
        // Notify page-level code
        if (typeof window.onWilsonSignOut === 'function') window.onWilsonSignOut();
        else if (typeof checkUserStatus === 'function') checkUserStatus();
        showWilsonToast('Signed out successfully');
    } catch (err) {
        console.error('[Auth] Sign-out error:', err);
    }
};

function showAuthError(msg) {
    const el = document.getElementById('wilson-auth-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showWilsonToast(msg, color = '#059669') {
    let t = document.getElementById('wilson-global-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'wilson-global-toast';
        t.style.cssText = `position:fixed;bottom:24px;right:24px;padding:12px 22px;border-radius:12px;
            color:white;font-weight:600;font-size:0.9rem;z-index:999999;
            box-shadow:0 8px 25px rgba(0,0,0,0.25);transform:translateX(120%);
            transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275);`;
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = color;
    t.style.transform = 'translateX(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.transform = 'translateX(120%)'; }, 3000);
}

// ── Auth State Listener ───────────────────────────────────────────────────────
onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        const merged = await mergeAndSaveLocal(firebaseUser);
        await saveUserToFirestore(firebaseUser, merged);

        updateNavUI(firebaseUser);

        // Notify the page (index.html uses currentUser, product-detail etc.)
        if (typeof window.onWilsonSignIn === 'function') {
            window.onWilsonSignIn(merged, firebaseUser);
        } else {
            // Generic: set currentUser if it exists in page scope
            if (typeof currentUser !== 'undefined') {
                currentUser = merged;
                if (typeof checkUserStatus === 'function') checkUserStatus();
            }
            // For pages that use window.currentUser
            window.currentUser = merged;
        }

        // Only show welcome toast on fresh sign-in, NOT on page reload/restore
        const isNewSession = !sessionStorage.getItem('wilson-session-active');
        if (isNewSession) {
            sessionStorage.setItem('wilson-session-active', '1');
            showWilsonToast(`Welcome, ${firebaseUser.displayName || firebaseUser.email}! 👋`);
        }
    } else {
        localStorage.removeItem('wilson-user');
        sessionStorage.removeItem('wilson-session-active');
        window.currentUser = null;
        updateNavUI(null);
        if (typeof window.onWilsonSignOut === 'function') window.onWilsonSignOut();
    }
});

// ── Auto-restore session from localStorage on page load ────────────────────────
// (Firebase auth state is async, so we optimistically set currentUser from cache)
const cachedUser = JSON.parse(localStorage.getItem('wilson-user') || 'null');
if (cachedUser) {
    window.currentUser = cachedUser;
    updateNavUI({ photoURL: cachedUser.profilePic, displayName: cachedUser.name });
}

// ── Export helpers via window so non-module scripts can use them ───────────────
window._wilsonAuth = {
    signInWithGoogle: window.wilsonSignInWithGoogle,
    signOut: window.wilsonSignOut,
    openModal: window.openAuthModal,
    closeModal: window.closeAuthModal,
    currentUser: () => window.currentUser,
    saveUserToFirestore,
};

export { auth, db, saveUserToFirestore };
