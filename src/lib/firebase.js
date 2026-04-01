import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, serverTimestamp, get, query, limitToLast } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // Hardcoding the regional database URL to ensure connectivity in the studio environment
  databaseURL: "https://terra-digital-twin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('DB URL being used:', firebaseConfig.databaseURL);

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log('Database instance initialized:', !!database);

export { app, database, ref, onValue, set, push, serverTimestamp, get, query, limitToLast };
