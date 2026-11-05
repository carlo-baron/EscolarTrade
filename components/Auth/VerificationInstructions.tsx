"use client"

import Link from "next/link"
import { useState } from "react"
import { sendEmailVerification } from "firebase/auth"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"

export function VerificationInstructions() {
  const [sending, setSending] = useState(false)

  async function resend() {
    const user = auth.currentUser
    if (!user) {
      toast.error("Log in first to request another verification email.")
      return
    }
    setSending(true)
    try {
      await sendEmailVerification(user)
      toast.success(
        "Verification email sent. Check your inbox and spam folder."
      )
    } catch {
      toast.error(
        "Verification email could not be sent. Please wait and try again."
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-2 text-sm" role="status">
      <p>
        Verify your school email using the link in your inbox, then log in again
        to continue.
      </p>
      <Button
        type="button"
        variant="outline"
        disabled={sending}
        onClick={resend}
      >
        {sending ? "Sending…" : "Resend verification email"}
      </Button>
    </div>
  )
}
