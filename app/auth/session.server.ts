"use server"

import { cookies } from "next/headers"
import { adminAuth } from "@/lib/firebase-admin"
import { assertSameOrigin } from "@/lib/auth/request"
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth/policy"
import { createVerifiedSession, SessionError } from "@/lib/auth/session-service"

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function createSession(idToken: string) {
  await assertSameOrigin()
  const cookieStore = await cookies()
  // Account changes must not leave a previous user's session behind on failure.
  cookieStore.set(SESSION_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 })
  try {
    const session = await createVerifiedSession(adminAuth, idToken)
    cookieStore.set(SESSION_COOKIE_NAME, session, {
      ...cookieOptions,
      maxAge: SESSION_DURATION_SECONDS,
      expires: new Date(Date.now() + SESSION_DURATION_SECONDS * 1000),
    })
    return { success: true } as const
  } catch (error) {
    if (error instanceof SessionError) {
      return { success: false, error: error.code } as const
    }
    return { success: false, error: "unavailable" } as const
  }
}

export async function clearSession() {
  await assertSameOrigin()
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  })
}
