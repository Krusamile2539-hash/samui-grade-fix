// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPb6xp_ja02h2vEzxrJq8zsVF_w37k0nk",
  authDomain: "ksm-exam-bank-live.firebaseapp.com",
  projectId: "ksm-exam-bank-live",
  storageBucket: "ksm-exam-bank-live.appspot.com",
  messagingSenderId: "733156612716",
  appId: "1:733156612716:web:a6ce936990cda7e7c09649",
  measurementId: "G-4H8RB0T6VF"
};

const app = initializeApp(firebaseConfig);

// 🔥 Firestore
export const db = getFirestore(app);
