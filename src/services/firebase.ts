import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseConfig } from '../models.ts';

const CONFIG_KEY = 'grade_fix_firebase_config';

export const getStoredConfig = (): FirebaseConfig | null => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const saveConfig = (config: FirebaseConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  window.location.reload();
};

export const clearConfig = () => {
  localStorage.removeItem(CONFIG_KEY);
  window.location.reload();
};

let db: Firestore | null = null;

const config = getStoredConfig();
if (config && config.apiKey) {
  try {
    const app = initializeApp(config);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } catch (e) {
    console.error("Firebase initialization failed:", e);
  }
}

export { db };
