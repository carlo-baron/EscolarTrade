import { initializeApp, getApps, getApp } from "firebase/app"
import { connectAuthEmulator, getAuth } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyA7pjo56VqPt1DrY3yEvhHLm-ZLT21gGAQ",
  authDomain: "escolar-trade.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "escolar-trade",
  storageBucket: "escolar-trade.firebasestorage.app",
  messagingSenderId: "287890627333",
  appId: "1:287890627333:web:06ecab30896a00c403356c",
  measurementId: "G-BVDZ6EQ2DQ",
}

const isNewApp = getApps().length === 0
const app = isNewApp ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)

if (
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" &&
  isNewApp
) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099")
  connectFirestoreEmulator(db, "127.0.0.1", 8080)
}

export { db, auth }
