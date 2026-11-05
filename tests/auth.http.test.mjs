import assert from "node:assert/strict"
import { before, after, test } from "node:test"
import { readFileSync } from "node:fs"
import { randomUUID } from "node:crypto"
import { initializeApp, deleteApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

const base = process.env.AUTH_TEST_BASE_URL ?? "http://localhost:3100"
assert.ok(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Local app only."
)
const projectId = process.env.GCLOUD_PROJECT
assert.ok(projectId?.startsWith("demo-"), "Demo project only.")
assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST)
assert.ok(process.env.FIRESTORE_EMULATOR_HOST)
const app = initializeApp({ projectId }, "http-tests")
const auth = getAuth(app)
const db = getFirestore(app)
const entries = Object.entries(
  JSON.parse(
    readFileSync(".next/server/server-reference-manifest.json", "utf8")
  ).node
)
const actionId = (name) =>
  entries.find(([, entry]) => entry.exportedName === name)?.[0]
assert.ok(actionId("createSession"))
assert.ok(actionId("clearSession"))
const users = {}
const listingId = "HttpTestListing00001"
const run = randomUUID().slice(0, 8)

before(async () => {
  for (const [label, domain, verified] of [
    ["school", "mls.ceu.edu.ph", true],
    ["other-school", "mls.ceu.edu.ph", true],
    ["unverified", "mls.ceu.edu.ph", false],
    ["foreign", "gmail.com", true],
  ]) {
    const email = `${label}-${run}@${domain}`
    const password = randomUUID()
    const user = await auth.createUser({
      email,
      password,
      emailVerified: verified,
    })
    const response = await fetch(
      `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-key`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    )
    assert.equal(response.status, 200)
    users[label] = { uid: user.uid, token: (await response.json()).idToken }
  }
  await db.doc(`listings/${listingId}`).set({ sellerId: users.school.uid })
})
after(async () => {
  await db.doc(`listings/${listingId}`).delete()
  for (const user of Object.values(users)) await auth.deleteUser(user.uid)
  await deleteApp(app)
})

async function action(name, args, cookie, origin = base) {
  return fetch(`${base}/auth?tab=login`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Next-Action": actionId(name),
      "Content-Type": "text/plain;charset=UTF-8",
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(args),
  })
}
async function navigate(path, cookie) {
  return fetch(`${base}${path}`, {
    redirect: "manual",
    headers: cookie ? { Cookie: cookie } : {},
  })
}
async function expectAuthRedirect(response, reason) {
  const location = response.headers.get("location")
  const body = await response.text()
  assert.ok(
    location?.includes(`/auth?tab=login&error=${reason}`) ||
      body.includes(`/auth?tab=login&amp;error=${reason}`) ||
      body.includes(`/auth?tab=login&error=${reason}`),
    `Expected auth redirect (${reason}); status ${response.status}`
  )
}

for (const path of ["/", "/auth", "/auth/forgot-password"]) {
  test(`public route stays accessible: ${path}`, async () =>
    assert.equal((await navigate(path)).status, 200))
}
for (const path of [
  "/marketplace",
  "/marketplace/sample",
  "/messages",
  "/messages/sample",
  "/my-listing",
  "/my-listing/new",
  `/my-listing/${listingId}`,
  "/profile",
  "/likes",
  "/help",
]) {
  test(`direct anonymous navigation denied: ${path}`, async () =>
    expectAuthRedirect(await navigate(path), "unauthenticated"))
}
for (const [label, reason] of [
  ["unverified", "unverified"],
  ["foreign", "domain"],
]) {
  test(`Server Action rejects ${label} login without setting an authenticated cookie`, async () => {
    const response = await action("createSession", [users[label].token])
    const body = await response.text()
    assert.ok(body.includes(`"error":"${reason}"`))
    assert.ok(response.headers.get("set-cookie")?.includes("Max-Age=0"))
  })
  test(`layout authorization rejects a Firebase-issued ${label} cookie on a full request`, async () => {
    const cookie = await auth.createSessionCookie(users[label].token, {
      expiresIn: 3600000,
    })
    await expectAuthRedirect(
      await navigate("/marketplace", `__session=${cookie}`),
      reason
    )
  })
}
test("invalid cookie passes proxy presence check and is rejected by the layout on a full request", async () => {
  await expectAuthRedirect(
    await navigate("/marketplace", "__session=invalid"),
    "unauthenticated"
  )
})
test("expired cookie is rejected on direct navigation", async () => {
  const cookie = await auth.createSessionCookie(users.school.token, {
    expiresIn: 3600000,
  })
  const parts = cookie.split(".")
  const claims = JSON.parse(Buffer.from(parts[1], "base64url"))
  claims.exp = Math.floor(Date.now() / 1000) - 60
  parts[1] = Buffer.from(JSON.stringify(claims)).toString("base64url")
  await expectAuthRedirect(
    await navigate("/marketplace", `__session=${parts.join(".")}`),
    "unauthenticated"
  )
})
test("verified login sets the production cookie, authorizes a page, and logout removes access", async () => {
  const login = await action("createSession", [users.school.token])
  assert.ok((await login.text()).includes('"success":true'))
  const setCookie = login.headers.get("set-cookie")
  for (const flag of [
    "HttpOnly",
    "Secure",
    "SameSite=lax",
    "Path=/",
    "Max-Age=432000",
  ])
    assert.ok(setCookie.includes(flag), flag)
  const cookie = setCookie.split(";")[0]
  assert.equal((await navigate("/marketplace", cookie)).status, 200)
  assert.equal((await navigate(`/my-listing/${listingId}`, cookie)).status, 200)
  const logout = await action("clearSession", [], cookie)
  assert.ok(logout.headers.get("set-cookie")?.includes("Max-Age=0"))
  await expectAuthRedirect(await navigate("/marketplace"), "unauthenticated")
})
test("a verified school user cannot open another seller's editor", async () => {
  const cookie = await auth.createSessionCookie(users["other-school"].token, {
    expiresIn: 3600000,
  })
  const response = await navigate(
    `/my-listing/${listingId}`,
    `__session=${cookie}`
  )
  const body = await response.text()
  assert.ok(
    response.status === 404 || body.includes("NEXT_HTTP_ERROR_FALLBACK;404")
  )
})
test("direct foreign-origin Server Action call cannot establish a session", async () => {
  const response = await action(
    "createSession",
    [users.school.token],
    undefined,
    "https://foreign.test"
  )
  assert.equal(response.headers.get("set-cookie"), null)
  assert.ok(!(await response.text()).includes('"success":true'))
})
