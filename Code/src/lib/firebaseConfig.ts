import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirebaseInitStatus {
  isConfigured: boolean;
  projectId: string;
  databaseId: string;
  authDomain: string;
  hasApiKey: boolean;
  error?: string;
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

const isConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'remixed-project-id'
);

export const firebaseStatus: FirebaseInitStatus = {
  isConfigured,
  projectId: firebaseConfig?.projectId || 'Not Configured',
  databaseId: (firebaseConfig as any)?.firestoreDatabaseId || '(default)',
  authDomain: firebaseConfig?.authDomain || '',
  hasApiKey: Boolean(firebaseConfig?.apiKey)
};

if (isConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Explicitly pass custom databaseId provisioned for this project
    const customDbId = (firebaseConfig as any)?.firestoreDatabaseId;
    db = customDbId ? getFirestore(app, customDbId) : getFirestore(app);
    
    // Test connectivity
    getDocFromServer(doc(db, 'test', 'connection')).catch(err => {
      // offline or rule check is normal on initial boot
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    firebaseStatus.error = message;
    console.warn('Firebase initialization error, fallback enabled:', err);
  }
}

export const googleAuthProvider = new GoogleAuthProvider();
export { app, auth, db };
