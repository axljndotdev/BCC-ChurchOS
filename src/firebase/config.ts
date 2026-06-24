import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
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
// We use initializeFirestore to ensure we can specify settings if needed for connectivity
export const db = isFirebaseConfigured ? 
  initializeFirestore(app as any, {
    experimentalForceLongPolling: true, // Force long polling to avoid WebSocket issues in some environments
    useFetchStreams: false // Prevent chunked streams blockage through proxy servers
  } as any, (firebaseConfig as any).firestoreDatabaseId) : null;

export const storage = isFirebaseConfigured ? getStorage(app) : null;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// CRITICAL: Validate Connection to Firestore as per instructions
async function testConnection() {
  if (!db) return;
  try {
    // This just verifies we can reach the server
    await getDocFromServer(doc(db, '_connection_test_', 'check'));
    console.log("Firestore connection verified successful.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client appears to be offline.");
    } else {
      console.warn("Firestore connection check failed (expected if rules deny or collection missing):", error);
    }
  }
}

if (isFirebaseConfigured) {
  testConnection();
}

export default app;
