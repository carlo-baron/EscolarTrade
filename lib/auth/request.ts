import "server-only"

import { headers } from "next/headers"

export async function assertSameOrigin() {
  const requestHeaders = await headers()
  const origin = requestHeaders.get("origin")
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  if (!origin || !host) throw new Error("Invalid request origin.")
  const url = new URL(origin)
  if (!["http:", "https:"].includes(url.protocol) || url.host !== host) {
    throw new Error("Invalid request origin.")
  }
}
