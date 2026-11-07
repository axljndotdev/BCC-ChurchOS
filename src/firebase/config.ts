import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBDi3B0Pb8OWemxgqhGgOsBHKXzsJi9TCU",
  authDomain: "ai-studio-applet-webapp-fc86e.firebaseapp.com",
  projectId: "ai-studio-applet-webapp-fc86e",
  storageBucket: "ai-studio-applet-webapp-fc86e.firebasestorage.app",
  messagingSenderId: "497739349812",
  appId: "1:497739349812:web:6e1a32ee5e141f57236f61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Pass your specific database ID here so it doesn't default to '(default)'
export const db = getFirestore(app, "ai-studio-1b82b8d3-9264-41a9-b4f1-1556ce2b7ad7");
export const auth = getAuth(app);
export const storage = getStorage(app);
export const isFirebaseConfigured = true;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });