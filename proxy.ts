import { NextResponse, type NextRequest } from "next/server"
import { authRedirect, SESSION_COOKIE_NAME } from "@/lib/auth/policy"

export function proxy(request: NextRequest) {
  const isAuthenticated = !!request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (request.nextUrl.pathname.startsWith("/auth") && isAuthenticated) {
    return NextResponse.redirect(new URL("/marketplace", request.url))
  }

  if (!request.nextUrl.pathname.startsWith("/auth") && request.method === "GET" && !isAuthenticated) {
    return NextResponse.redirect(new URL(authRedirect("unauthenticated"), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/marketplace/:path*",
    "/messages/:path*",
    "/my-listing/:path*",
    "/profile/:path*",
    "/likes/:path*",
    "/help/:path*",
  ],
}
