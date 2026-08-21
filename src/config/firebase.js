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

// Production Google Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA2tpNvnErVdj6NSNr7V6Ag0rf0L1lSq1U",
  authDomain: "omniprep-85610.firebaseapp.com",
  projectId: "omniprep-85610",
  storageBucket: "omniprep-85610.firebasestorage.app",
  messagingSenderId: "717289415604",
  appId: "1:717289415604:web:9f355ed20d4f9f2a72c8e1",
  measurementId: "G-LWL3SK8LGG"
};

export const isFirebaseConfigured = true;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

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
