import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Check if Firebase config is available
const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                          import.meta.env.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = hasFirebaseConfig ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
} : {
  // Demo/placeholder config - replace with your Firebase config
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase only if we have a real config
let app = null;
let auth = null;
let db = null;
let messaging = null;

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize messaging asynchronously
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      }
    }).catch((error) => {
      console.warn('Firebase messaging not supported:', error);
    });
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { auth, db, messaging };
export default app;
