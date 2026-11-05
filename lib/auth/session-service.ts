import "server-only"

import type { Auth, DecodedIdToken } from "firebase-admin/auth"
import {
  isSchoolEmail,
  SESSION_DURATION_SECONDS,
  type AuthErrorCode,
} from "@/lib/auth/policy"

type SessionAuth = Pick<
  Auth,
  "verifyIdToken" | "createSessionCookie" | "verifySessionCookie"
>

export class SessionError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code)
  }
}

function authorizeClaims(claims: DecodedIdToken) {
  if (
    !claims.uid ||
    !Number.isFinite(claims.exp) ||
    claims.exp <= Date.now() / 1000
  ) {
    throw new SessionError("unauthenticated")
  }
  if (!isSchoolEmail(claims.email)) throw new SessionError("domain")
  if (claims.email_verified !== true) throw new SessionError("unverified")
  return claims
}

export async function createVerifiedSession(
  auth: SessionAuth,
  idToken: unknown
) {
  if (typeof idToken !== "string" || !idToken || idToken.length > 16384) {
    throw new SessionError("unauthenticated")
  }

  let claims: DecodedIdToken
  try {
    claims = await auth.verifyIdToken(idToken, true)
  } catch {
    throw new SessionError("unauthenticated")
  }
  authorizeClaims(claims)

  const age = Date.now() / 1000 - claims.auth_time
  if (!Number.isFinite(age) || age < 0 || age >= 5 * 60) {
    throw new SessionError("recent-login")
  }

  return auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_SECONDS * 1000,
  })
}

export async function verifySchoolSession(
  auth: SessionAuth,
  cookie: string | undefined
) {
  if (!cookie) throw new SessionError("unauthenticated")

  let claims: DecodedIdToken
  try {
    // Also rejects revoked sessions and disabled/deleted accounts.
    claims = await auth.verifySessionCookie(cookie, true)
  } catch {
    throw new SessionError("unauthenticated")
  }
  return authorizeClaims(claims)
}

export function assertListingOwner(
  uid: string,
  listing: { sellerId?: unknown }
) {
  if (listing.sellerId !== uid)
    throw new Error("Forbidden: listing belongs to another seller.")
}
