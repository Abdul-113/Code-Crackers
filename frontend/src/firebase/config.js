import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Fallback values for local testing/prototype deployment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "invoice2credit-mock.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "invoice2credit-mock",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "invoice2credit-mock.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:mockapp"
};

let app;
let auth;
let db;
let isMock = false;

// If we are in local development without actual configuration, we run in mock/local-storage demo mode
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "mock-api-key";

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed, falling back to mock mode:", error);
    isMock = true;
  }
} else {
  isMock = true;
}

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, isMock };
