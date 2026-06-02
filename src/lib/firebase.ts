import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration - API keys are public by Firebase design.
// Real security is enforced by Firebase Security Rules in the console.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDX7Z8o5xVJa8cSHvaurZg4FkJvN8mJuto",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "free-fire-kingdom.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://free-fire-kingdom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "free-fire-kingdom",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "free-fire-kingdom.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "889375613179",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:889375613179:web:b36bd72dd208b101e0d05e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0EWSZ3SFX1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
