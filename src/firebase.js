// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// Ваша конфігурація Firebase
// Отримайте з Firebase Console -> Project Settings -> General -> Your apps
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);

// Ініціалізація Authentication
export const auth = getAuth(app);

// Ініціалізація Realtime Database
export const database = getDatabase(app);

// Підключення до емулятора для локальної розробки
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectDatabaseEmulator(database, '127.0.0.1', 9000);
  console.log('🔧 Connected to Firebase Database Emulator');
}

export default app;