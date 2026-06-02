import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const FALLBACK_CONFIG = {
  apiKey: "AIzaSyDX7Z8o5xVJa8cSHvaurZg4FkJvN8mJuto",
  authDomain: "free-fire-kingdom.firebaseapp.com",
  databaseURL: "https://free-fire-kingdom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "free-fire-kingdom",
  storageBucket: "free-fire-kingdom.firebasestorage.app",
  messagingSenderId: "889375613179",
  appId: "1:889375613179:web:b36bd72dd208b101e0d05e",
  measurementId: "G-0EWSZ3SFX1"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || FALLBACK_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || FALLBACK_CONFIG.authDomain,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || FALLBACK_CONFIG.databaseURL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || FALLBACK_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || FALLBACK_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || FALLBACK_CONFIG.measurementId
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
