import "server-only" // errors at build time if imported in a client component
import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
} from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

const app =
  getApps()[0] ??
  initializeApp({
    projectId:
      process.env.FIREBASE_PROJECT_ID ??
      process.env.GCLOUD_PROJECT ??
      "escolar-trade",
    credential: process.env.FIREBASE_PRIVATE_KEY
      ? cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        })
      : applicationDefault(),
  })

export const adminDb = getFirestore(app)
export const adminAuth = getAuth(app)
