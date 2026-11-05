import assert from "node:assert/strict"
import { beforeEach, mock, test } from "node:test"
import {
  createVerifiedSession,
  verifySchoolSession,
  assertListingOwner,
} from "../lib/auth/session-service.ts"
import {
  isSchoolEmail,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "../lib/auth/policy.ts"

const now = () => Math.floor(Date.now() / 1000)
const claims = () => ({
  uid: "school-user",
  email: "student@mls.ceu.edu.ph",
  email_verified: true,
  auth_time: now(),
  exp: now() + 3600,
})
let identity, stored, options, requestHeaders, sdkError, reads
const sdk = {
  async verifyIdToken(token, revoked) {
    assert.equal(token, "id-token")
    assert.equal(revoked, true)
    if (sdkError) throw sdkError
    return identity
  },
  async createSessionCookie(token, config) {
    assert.equal(token, "id-token")
    assert.equal(config.expiresIn, SESSION_DURATION_SECONDS * 1000)
    return "verified-session"
  },
  async verifySessionCookie(cookie, revoked) {
    assert.equal(cookie, "verified-session")
    assert.equal(revoked, true)
    if (sdkError) throw sdkError
    return identity
  },
}
const cookieStore = {
  get(name) {
    assert.equal(name, SESSION_COOKIE_NAME)
    return stored ? { value: stored } : undefined
  },
  set(name, value, config) {
    assert.equal(name, SESSION_COOKIE_NAME)
    stored = value
    options = config
  },
}

mock.module("next/headers", {
  namedExports: {
    cookies: async () => cookieStore,
    headers: async () => requestHeaders,
  },
})
mock.module("next/navigation", {
  namedExports: {
    redirect: (url) => {
      throw new Error(`REDIRECT:${url}`)
    },
    notFound: () => {
      throw new Error("NOT_FOUND")
    },
  },
})
mock.module("../lib/firebase-admin.ts", {
  namedExports: {
    adminAuth: sdk,
    adminDb: {
      collection: () => ({
        doc: () => ({
          get: async () => {
            reads++
            return { data: () => ({ sellerId: "school-user" }) }
          },
        }),
      }),
    },
  },
})

const { createSession, clearSession } =
  await import("../app/auth/session.server.ts")
const { requireSession, requireListingOwner } =
  await import("../lib/auth/session.ts")

beforeEach(() => {
  identity = claims()
  stored = undefined
  options = undefined
  sdkError = undefined
  reads = 0
  requestHeaders = new Headers({
    origin: "http://localhost:3000",
    host: "localhost:3000",
  })
})

for (const email of [
  "student@gmail.com",
  "student@ceu.mls.edu.ph",
  "student@sub.mls.ceu.edu.ph",
  "student@mls.ceu.edu.ph.evil.test",
  "student@@mls.ceu.edu.ph",
  "@mls.ceu.edu.ph",
]) {
  test(`reject exact-domain bypass: ${email}`, () =>
    assert.equal(isSchoolEmail(email), false))
}
test("accept case-insensitive exact school domain", () =>
  assert.equal(isSchoolEmail("Student@MLS.CEU.EDU.PH"), true))
test("direct navigation without a session redirects to login", async () => {
  await assert.rejects(requireSession(), /REDIRECT:.*error=unauthenticated/)
})
test("unverified school account receives no cookie, including when switching accounts", async () => {
  identity.email_verified = false
  stored = "old-account-cookie"
  assert.deepEqual(await createSession("id-token"), {
    success: false,
    error: "unverified",
  })
  assert.equal(stored, "")
})
test("verified account from another domain receives no cookie", async () => {
  identity.email = "student@gmail.com"
  assert.deepEqual(await createSession("id-token"), {
    success: false,
    error: "domain",
  })
  assert.equal(stored, "")
})
test("valid login establishes a verified session with cookie protections", async () => {
  assert.deepEqual(await createSession("id-token"), { success: true })
  assert.equal(stored, "verified-session")
  assert.equal(options.httpOnly, true)
  assert.equal(options.secure, process.env.NODE_ENV === "production")
  assert.equal(options.sameSite, "lax")
  assert.equal(options.path, "/")
  assert.equal(options.maxAge, 432000)
  assert.ok(options.expires.getTime() > Date.now())
  assert.equal((await requireSession()).uid, "school-user")
})
for (const age of [300, 301, -60, NaN]) {
  test(`reject stale/future/missing authentication time (${age})`, async () => {
    identity.auth_time = now() - age
    await assert.rejects(createVerifiedSession(sdk, "id-token"), {
      code: "recent-login",
    })
  })
}
test("refreshing a token does not replace recent authentication", async () => {
  identity.auth_time = now() - 3600
  identity.iat = now()
  await assert.rejects(createVerifiedSession(sdk, "id-token"), {
    code: "recent-login",
  })
})
test("invalid/revoked/expired session fails closed", async () => {
  stored = "verified-session"
  sdkError = new Error("signature, expiry, or revocation rejected by Admin")
  await assert.rejects(requireSession(), /error=unauthenticated/)
})
test("expired claims fail even if a verifier returns them", async () => {
  identity.exp = now() - 1
  await assert.rejects(verifySchoolSession(sdk, "verified-session"), {
    code: "unauthenticated",
  })
})
for (const [field, value, reason] of [
  ["email_verified", false, "unverified"],
  ["email", "student@gmail.com", "domain"],
  ["uid", "", "unauthenticated"],
]) {
  test(`session claims are rechecked: ${field}`, async () => {
    stored = "verified-session"
    identity[field] = value
    await assert.rejects(requireSession(), new RegExp(`error=${reason}`))
  })
}
test("verification followed by fresh login can establish a session", async () => {
  identity.email_verified = false
  assert.equal((await createSession("id-token")).success, false)
  identity.email_verified = true
  assert.equal((await createSession("id-token")).success, true)
})
test("direct invocation of the listing authorization boundary stops before database access", async () => {
  await assert.rejects(
    requireListingOwner("a".repeat(20)),
    /error=unauthenticated/
  )
  assert.equal(reads, 0)
})
test("valid session does not permit another seller's listing", () => {
  assert.throws(
    () => assertListingOwner("attacker", { sellerId: "owner" }),
    /Forbidden/
  )
  assert.doesNotThrow(() => assertListingOwner("owner", { sellerId: "owner" }))
})
test("owner may access their listing after session verification", async () => {
  stored = "verified-session"
  assert.equal(
    (await requireListingOwner("a".repeat(20))).session.uid,
    "school-user"
  )
  assert.equal(reads, 1)
})
for (const origin of [undefined, "https://evil.test", "null"]) {
  test(`cookie-changing action rejects missing/foreign origin: ${origin}`, async () => {
    if (origin) requestHeaders.set("origin", origin)
    else requestHeaders.delete("origin")
    await assert.rejects(createSession("id-token"))
    assert.equal(stored, undefined)
  })
}
test("logout expires the server cookie and subsequent navigation is denied", async () => {
  await createSession("id-token")
  await clearSession()
  assert.equal(stored, "")
  assert.equal(options.maxAge, 0)
  assert.equal(options.path, "/")
  await assert.rejects(requireSession(), /error=unauthenticated/)
})
