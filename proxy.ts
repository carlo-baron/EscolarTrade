import { NextResponse, type NextRequest } from "next/server"
import { authRedirect, SESSION_COOKIE_NAME } from "@/lib/auth/policy"

export function proxy(request: NextRequest) {
  // Only an early navigation check. The shared layout verifies the cookie with
  // Admin; data access and Server Actions must perform their own authorization.
  if (request.method === "GET" && !request.cookies.get(SESSION_COOKIE_NAME)?.value) {
    return NextResponse.redirect(new URL(authRedirect("unauthenticated"), request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/marketplace/:path*",
    "/messages/:path*",
    "/my-listing/:path*",
    "/profile/:path*",
    "/likes/:path*",
    "/help/:path*",
  ],
}
