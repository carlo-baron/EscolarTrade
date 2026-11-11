"use client"

import { useState } from "react"
import { signOut } from "firebase/auth"
import { toast } from "sonner"
import { clearSession } from "@/app/auth/session.server"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const [pending, setPending] = useState(false)

  async function logout() {
    setPending(true)
    const results = await Promise.allSettled([clearSession(), signOut(auth)])
    if (results.some((result) => result.status === "rejected")) {
      toast.error("Logout could not finish. Please try again.")
      setPending(false)
      return
    }
    window.location.replace("/auth?tab=login")
  }

  return (
    <Button type="button" variant="destructive" onClick={logout} disabled={pending} className="w-full font-normal">
      {pending ? "Logging out…" : "Log out"}
    </Button>
  )
}
