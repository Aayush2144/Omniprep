import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';

const FIREBASE_CONFIG_STORAGE = 'omniprep_firebase_config_v1';

// Default / Environment Firebase Config
export const getActiveFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey) return parsed;
    }
  } catch (e) {}

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  };
};

export const saveCustomFirebaseConfig = (config) => {
  if (config && config.apiKey) {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE, JSON.stringify(config));
    window.location.reload();
  }
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE);
  window.location.reload();
};

const config = getActiveFirebaseConfig();
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('[Firebase Init Warning]:', error.message);
  }
}

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
};
