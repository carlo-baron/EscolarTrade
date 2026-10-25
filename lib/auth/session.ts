import "server-only"

import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { authRedirect, SESSION_COOKIE_NAME } from "@/lib/auth/policy"
import {
  assertListingOwner,
  SessionError,
  verifySchoolSession,
} from "@/lib/auth/session-service"

// Deliberately not cached across requests or mutations.
export async function requireSession() {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value
  try {
    return await verifySchoolSession(adminAuth, cookie)
  } catch (error) {
    if (error instanceof SessionError) redirect(authRedirect(error.code))
    throw error
  }
}

export async function requireListingOwner(listingId: string) {
  const session = await requireSession()
  if (!/^[a-zA-Z0-9]{20}$/.test(listingId)) notFound()
  const listing = await adminDb.collection("listings").doc(listingId).get()
  const data = listing.data()
  if (!data) notFound()
  try {
    assertListingOwner(session.uid, data)
  } catch {
    notFound()
  }
  return { session, listing }
}
