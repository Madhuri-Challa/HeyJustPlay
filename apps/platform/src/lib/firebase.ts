import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously, type Auth, type User } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every((value) => {
    if (typeof value !== "string") {
      return false;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 && !trimmedValue.startsWith("your-") && !trimmedValue.includes("your-project");
  });
}

export function getFirebaseServices() {
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase environment variables are missing. Copy .env.example to .env.local and fill in your Firebase project values.");
  }

  if (!authInstance || !dbInstance) {
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  }

  return { auth: authInstance, db: dbInstance };
}

export function ensureAnonymousUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    let auth: Auth;
    try {
      auth = getFirebaseServices().auth;
    } catch (error) {
      reject(error);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
          return;
        }

        try {
          const credential = await signInAnonymously(auth);
          resolve(credential.user);
        } catch (error) {
          reject(error);
        }
      },
      reject,
    );
  });
}
