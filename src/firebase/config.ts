import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import the Firebase configuration from the auto-generated file
import firebaseConfig from '../../firebase-applet-config.json';

// Check if Firebase is properly configured
export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

let app;
if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

export const auth = isFirebaseConfigured ? getAuth(app) : null;
// Use the named database if provided in the config
export const db = isFirebaseConfigured ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId) : null;
export const storage = isFirebaseConfigured ? getStorage(app) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
