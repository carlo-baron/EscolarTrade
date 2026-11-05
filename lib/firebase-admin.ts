import "server-only"
import {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
} from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import {
  firebaseAppName,
  firebaseEmulators,
  firebaseProjectId,
  useFirebaseEmulators,
} from "@/lib/firebase-config"

// Admin reads these variables independently of the browser SDK.
if (useFirebaseEmulators) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = `${firebaseEmulators.host}:${firebaseEmulators.authPort}`
  process.env.FIRESTORE_EMULATOR_HOST = `${firebaseEmulators.host}:${firebaseEmulators.firestorePort}`
} else {
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST
  delete process.env.FIRESTORE_EMULATOR_HOST
}

const app =
  getApps().find((app) => app.name === firebaseAppName) ??
  initializeApp(
    {
      projectId: firebaseProjectId,
      ...(!useFirebaseEmulators && {
        credential: process.env.FIREBASE_PRIVATE_KEY
          ? cert({
              projectId: firebaseProjectId,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(
                /\\n/g,
                "\n"
              ),
            })
          : applicationDefault(),
      }),
    },
    firebaseAppName
  )

export const adminDb = getFirestore(app)
export const adminAuth = getAuth(app)
