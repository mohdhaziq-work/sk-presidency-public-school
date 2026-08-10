'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDYHVi3c-cNvdcMON5wcPjRrJ1nxpdrw2Y",
  authDomain: "sk-presidency-public-school.firebaseapp.com",
  projectId: "sk-presidency-public-school",
  storageBucket: "sk-presidency-public-school.firebasestorage.app",
  messagingSenderId: "808351998605",
  appId: "1:808351998605:web:0c8d072cfea4efa74278c4",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth, firebaseConfig };
