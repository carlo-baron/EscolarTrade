import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { test } from "node:test"

function run(mode, nodeEnv) {
  const env = {
    ...process.env,
    NODE_ENV: nodeEnv,
    // Old overrides must not split the browser and Admin environments.
    FIREBASE_PROJECT_ID: "wrong-project",
    GCLOUD_PROJECT: "wrong-project",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "wrong-project",
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
    FIREBASE_AUTH_EMULATOR_HOST: "localhost:19999",
    FIRESTORE_EMULATOR_HOST: "localhost:18888",
  }
  delete env.NEXT_PUBLIC_FIREBASE_MODE
  delete env.NODE_TEST_CONTEXT
  delete env.FIREBASE_PRIVATE_KEY
  delete env.FIREBASE_CLIENT_EMAIL
  if (mode !== undefined) env.NEXT_PUBLIC_FIREBASE_MODE = mode
  if (mode !== "live") env.FIREBASE_PRIVATE_KEY = "unused-emulator-credential"

  return spawnSync(
    process.execPath,
    [
      "--import",
      "./tests/register.mjs",
      "--input-type=module",
      "-e",
      `
        import assert from "node:assert/strict"
        const config = await import("./lib/firebase-config.ts")
        const { db, auth } = await import("./lib/firebase.ts")
        const { adminDb, adminAuth } = await import("./lib/firebase-admin.ts")
        const emulator = process.env.NEXT_PUBLIC_FIREBASE_MODE !== "live"
        const project = emulator ? "demo-escolartrade" : "escolar-trade"
        const name = emulator ? "escolartrade-emulator" : "escolartrade-live"
        assert.equal(config.firebaseProjectId, project)
        assert.equal(db.app.options.projectId, project)
        assert.equal(auth.app.name, name)
        assert.equal(adminAuth.app.options.projectId, project)
        assert.equal(adminDb.projectId, project)
        assert.equal(adminAuth.app.name, name)
        assert.equal(db._settings.host, emulator ? "127.0.0.1:8080" : "firestore.googleapis.com")
        assert.equal(adminDb._settings.servicePath, emulator ? "127.0.0.1" : undefined)
        assert.equal(adminDb._settings.port, emulator ? 8080 : undefined)
        assert.equal(adminDb._settings.ssl, emulator ? false : undefined)
        assert.equal(adminAuth.emulatorMode, emulator)
        if (emulator) {
          assert.equal(auth.emulatorConfig.host, "127.0.0.1")
          assert.equal(auth.emulatorConfig.port, 9099)
          assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST, "127.0.0.1:9099")
          assert.equal(process.env.FIRESTORE_EMULATOR_HOST, "127.0.0.1:8080")
        } else {
          assert.equal(auth.emulatorConfig, null)
          assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST, undefined)
          assert.equal(process.env.FIRESTORE_EMULATOR_HOST, undefined)
        }
        const { terminate } = await import("firebase/firestore")
        await Promise.all([terminate(db), adminDb.terminate()])
      `,
    ],
    {
      cwd: new URL("../", import.meta.url),
      env,
      encoding: "utf8",
      timeout: 15000,
    }
  )
}

for (const nodeEnv of ["development", "production"]) {
  for (const mode of [undefined, "emulator", "live"]) {
    test(`${mode ?? "default"} mode configures both SDKs in ${nodeEnv}`, () => {
      const result = run(mode, nodeEnv)
      assert.equal(result.status, 0, result.stderr || String(result.error))
    })
  }
}

for (const mode of ["", "production", "LIVE"]) {
  test(`reject invalid mode ${JSON.stringify(mode)} before SDK initialization`, () => {
    const result = run(mode, "development")
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /NEXT_PUBLIC_FIREBASE_MODE must be/)
  })
}
