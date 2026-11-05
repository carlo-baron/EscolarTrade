import { initializeApp, getApps, getApp } from "firebase/app"
import { connectAuthEmulator, getAuth } from "firebase/auth"
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore"
import {
  firebaseAppName,
  firebaseEmulators,
  firebaseProjectId,
  useFirebaseEmulators,
} from "@/lib/firebase-config"

const firebaseConfig = {
  apiKey: "AIzaSyA7pjo56VqPt1DrY3yEvhHLm-ZLT21gGAQ",
  authDomain: "escolar-trade.firebaseapp.com",
  projectId: firebaseProjectId,
  storageBucket: "escolar-trade.firebasestorage.app",
  messagingSenderId: "287890627333",
  appId: "1:287890627333:web:06ecab30896a00c403356c",
  measurementId: "G-BVDZ6EQ2DQ",
}

const isNewApp = !getApps().some((app) => app.name === firebaseAppName)
const app = isNewApp
  ? initializeApp(firebaseConfig, firebaseAppName)
  : getApp(firebaseAppName)
const db = getFirestore(app)
const auth = getAuth(app)

if (useFirebaseEmulators && isNewApp) {
  connectAuthEmulator(
    auth,
    `http://${firebaseEmulators.host}:${firebaseEmulators.authPort}`
  )
  connectFirestoreEmulator(
    db,
    firebaseEmulators.host,
    firebaseEmulators.firestorePort
  )
}

export { db, auth }
