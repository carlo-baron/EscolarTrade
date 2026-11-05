const mode = process.env.NEXT_PUBLIC_FIREBASE_MODE ?? "emulator"

if (mode !== "emulator" && mode !== "live") {
  throw new Error('NEXT_PUBLIC_FIREBASE_MODE must be "emulator" or "live".')
}

export const firebaseMode = mode
export const useFirebaseEmulators = mode === "emulator"
export const firebaseAppName = `escolartrade-${mode}`
export const firebaseProjectId = useFirebaseEmulators
  ? "demo-escolartrade"
  : "escolar-trade"

export const firebaseEmulators = {
  host: "127.0.0.1",
  authPort: 9099,
  firestorePort: 8080,
} as const
