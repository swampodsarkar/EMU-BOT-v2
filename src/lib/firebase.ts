import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDX7Z8o5xVJa8cSHvaurZg4FkJvN8mJuto",
  authDomain: "free-fire-kingdom.firebaseapp.com",
  databaseURL: "https://free-fire-kingdom-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "free-fire-kingdom",
  storageBucket: "free-fire-kingdom.firebasestorage.app",
  messagingSenderId: "889375613179",
  appId: "1:889375613179:web:b36bd72dd208b101e0d05e",
  measurementId: "G-0EWSZ3SFX1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
