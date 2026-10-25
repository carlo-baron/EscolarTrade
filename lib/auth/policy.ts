export const SCHOOL_EMAIL_DOMAIN = "mls.ceu.edu.ph"
export const SCHOOL_EMAIL_PATTERN = "[^\\s@]+@mls\\.ceu\\.edu\\.ph"
export const SESSION_COOKIE_NAME = "__session"
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 5

export type AuthErrorCode =
  "unauthenticated" | "unverified" | "domain" | "recent-login"

export function isSchoolEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]+@mls\.ceu\.edu\.ph$/i.test(email)
}

export function authRedirect(error: AuthErrorCode) {
  return `/auth?tab=login&error=${error}`
}

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  unauthenticated: "Please log in to continue. Your session may have expired.",
  unverified: "Verify your school email, then log in again to continue.",
  domain: `Use a verified @${SCHOOL_EMAIL_DOMAIN} email account.`,
  "recent-login": "Please log in again to establish a fresh session.",
}
