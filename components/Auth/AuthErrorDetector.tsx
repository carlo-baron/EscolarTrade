"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import { AUTH_ERROR_MESSAGES, type AuthErrorCode } from "@/lib/auth/policy"

export function AuthErrorDetector() {
  const params = useSearchParams()
  const error = params.get("error")

  useEffect(() => {
    if (error && Object.hasOwn(AUTH_ERROR_MESSAGES, error)) {
      toast.error("Access requires school verification", {
        id: `auth-${error}`,
        description: AUTH_ERROR_MESSAGES[error as AuthErrorCode],
      })
    }
  }, [error])

  return null
}
