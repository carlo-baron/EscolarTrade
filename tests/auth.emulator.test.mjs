import assert from "node:assert/strict"
import { after, before, test } from "node:test"
import { randomUUID } from "node:crypto"
import { initializeApp, deleteApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import {
  createVerifiedSession,
  verifySchoolSession,
} from "../lib/auth/session-service.ts"

const projectId = process.env.GCLOUD_PROJECT
assert.ok(
  projectId?.startsWith("demo-"),
  "Use an isolated demo project; never live Firebase."
)
assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Auth emulator is required.")
assert.ok(
  process.env.FIRESTORE_EMULATOR_HOST,
  "Firestore emulator is required."
)
const app = initializeApp({ projectId }, "auth-tests")
const auth = getAuth(app)
const db = getFirestore(app)
const run = randomUUID().replaceAll("-", "").slice(0, 10)
const listingId = "AuthTestListing00001"
const users = {}
const authUrl = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1`
const dbUrl = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${projectId}/databases/(default)/documents`

async function signIn(email, password) {
  const response = await fetch(
    `${authUrl}/accounts:signInWithPassword?key=fake-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  )
  assert.equal(response.status, 200)
  return (await response.json()).idToken
}

before(async () => {
  for (const [label, domain, verified] of [
    ["school", "mls.ceu.edu.ph", true],
    ["unverified", "mls.ceu.edu.ph", false],
    ["foreign", "gmail.com", true],
    ["suffix", "mls.ceu.edu.ph.evil.test", true],
    ["old-domain", "ceu.mls.edu.ph", true],
  ]) {
    const email = `${label}-${run}@${domain}`
    const password = randomUUID()
    const user = await auth.createUser({
      email,
      password,
      emailVerified: verified,
    })
    users[label] = {
      uid: user.uid,
      token: await signIn(email, password),
      email,
      password,
    }
  }
  await db
    .doc(`listings/${listingId}`)
    .set({
      sellerId: users.school.uid,
      moderationStatus: "visible",
      status: "Available",
    })
  await db
    .doc(`users/${users.school.uid}`)
    .set({ displayName: "School Student" })
})
after(async () => {
  await db.doc(`listings/${listingId}`).delete()
  await db.doc(`users/${users.school.uid}`).delete()
  await db.doc(`users/${users.school.uid}/likes/${listingId}`).delete()
  for (const user of Object.values(users)) await auth.deleteUser(user.uid)
  await deleteApp(app)
})

test("Admin exchanges a real emulator ID token for a school session", async () => {
  const cookie = await createVerifiedSession(auth, users.school.token)
  assert.equal((await verifySchoolSession(auth, cookie)).uid, users.school.uid)
})
for (const [label, code] of [
  ["unverified", "unverified"],
  ["foreign", "domain"],
  ["suffix", "domain"],
  ["old-domain", "domain"],
]) {
  test(`real emulator token rejected: ${label}`, async () => {
    await assert.rejects(createVerifiedSession(auth, users[label].token), {
      code,
    })
  })
}
test("real Admin rejects a malformed session", async () => {
  await assert.rejects(verifySchoolSession(auth, "invalid-cookie"), {
    code: "unauthenticated",
  })
})
test("real Admin rejects an expired session", async () => {
  const cookie = await createVerifiedSession(auth, users.school.token)
  const parts = cookie.split(".")
  const claims = JSON.parse(Buffer.from(parts[1], "base64url"))
  claims.exp = Math.floor(Date.now() / 1000) - 60
  parts[1] = Buffer.from(JSON.stringify(claims)).toString("base64url")
  // Auth emulator tokens are unsigned. This checks expiry, not production signatures.
  await assert.rejects(verifySchoolSession(auth, parts.join(".")), {
    code: "unauthenticated",
  })
})
test("verification plus a fresh client login enables a session", async () => {
  const user = users.unverified
  await auth.updateUser(user.uid, { emailVerified: true })
  const token = await signIn(user.email, user.password)
  assert.equal(
    (await verifySchoolSession(auth, await createVerifiedSession(auth, token)))
      .uid,
    user.uid
  )
  // Restore unverified state for subsequent Rules rejection checks.
  await auth.updateUser(user.uid, { emailVerified: false })
})

async function read(path, token) {
  return fetch(`${dbUrl}/${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}
for (const label of [
  undefined,
  "unverified",
  "foreign",
  "suffix",
  "old-domain",
]) {
  test(`Rules deny listing/profile reads for ${label ?? "anonymous"}`, async () => {
    const token = label ? users[label].token : undefined
    assert.equal((await read(`listings/${listingId}`, token)).status, 403)
    assert.equal((await read(`users/${users.school.uid}`, token)).status, 403)
  })
}
test("Rules allow verified school ID token reads; a browser cookie alone grants no access", async () => {
  assert.equal(
    (await read(`listings/${listingId}`, users.school.token)).status,
    200
  )
  assert.equal(
    (await read(`users/${users.school.uid}`, users.school.token)).status,
    200
  )
  const cookie = await createVerifiedSession(auth, users.school.token)
  const response = await fetch(`${dbUrl}/listings/${listingId}`, {
    headers: { Cookie: `__session=${cookie}` },
  })
  assert.equal(response.status, 403)
})
test("Rules still deny all direct listing mutations", async () => {
  const response = await fetch(`${dbUrl}/listings/${listingId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${users.school.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: { sellerId: { stringValue: users.school.uid } },
    }),
  })
  assert.equal(response.status, 403)
})
test("Rules preserve like ownership with verified school accounts", async () => {
  const { initializeApp: clientApp, deleteApp: deleteClientApp } =
    await import("firebase/app")
  const {
    getFirestore: clientDb,
    connectFirestoreEmulator,
    doc,
    setDoc,
    serverTimestamp,
  } = await import("firebase/firestore")
  const { getAuth: clientAuth, connectAuthEmulator } =
    await import("firebase/auth")
  const client = clientApp({ projectId, apiKey: "fake-key" }, "rules-client")
  const clientAuthInstance = clientAuth(client)
  const clientDbInstance = clientDb(client)
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(":")
  connectFirestoreEmulator(clientDbInstance, host, Number(port))
  connectAuthEmulator(
    clientAuthInstance,
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`,
    { disableWarnings: true }
  )
  try {
    // A custom token needs signing credentials, so reuse emulator email/password login.
    const { signInWithEmailAndPassword } = await import("firebase/auth")
    await signInWithEmailAndPassword(
      clientAuthInstance,
      users.school.email,
      users.school.password
    )
    await setDoc(
      doc(clientDbInstance, `users/${users.school.uid}/likes/${listingId}`),
      { createdAt: serverTimestamp() }
    )
    await assert.rejects(
      setDoc(
        doc(clientDbInstance, `users/${users.foreign.uid}/likes/${listingId}`),
        { createdAt: serverTimestamp() }
      )
    )
  } finally {
    await deleteClientApp(client)
  }
})
test("disabled accounts fail real Admin session verification", async () => {
  const cookie = await createVerifiedSession(auth, users.school.token)
  await auth.updateUser(users.school.uid, { disabled: true })
  await assert.rejects(verifySchoolSession(auth, cookie), {
    code: "unauthenticated",
  })
  await auth.updateUser(users.school.uid, { disabled: false })
})
