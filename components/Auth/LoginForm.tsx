"use client"

import { PasswordInput } from "@/components/ui/password-input"
import {
  Field,
  FieldSet,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLogin } from "@/hooks/auth/login.hook"
import { useState } from "react"
import { FirebaseError } from "firebase/app"
import { SCHOOL_EMAIL_PATTERN, AUTH_ERROR_MESSAGES } from "@/lib/auth/policy"
import { VerificationInstructions } from "@/components/Auth/VerificationInstructions"
import { Spinner } from "../ui/spinner"

export function LoginForm({
  unverifiedHint = false,
}: {
  unverifiedHint?: boolean
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [unverified, setUnverified] = useState(unverifiedHint)
  const login = useLogin()

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()
        setSubmitting(true)
        setError("")
        setUnverified(false)

        const formData = new FormData(event.currentTarget)
        try {
          const result = await login(
            formData.get("login-email") as string,
            formData.get("login-password") as string
          )
          if (!result.success) {
            setError(AUTH_ERROR_MESSAGES[result.error])
            setUnverified(result.error === "unverified")
          }
        } catch (error) {
          if (error instanceof FirebaseError) {
            if (error.code === "auth/invalid-credential")
              setError("Invalid email or password.")
            else setError("Unable to log in. Please try again.")
          } else
            setError(
              error instanceof Error
                ? error.message
                : "Unable to log in. Please try again."
            )
        } finally {
          setSubmitting(false)
        }
      }}
    >
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="login-email" className="flex gap-0">
              CEU Email Account<sup className="text-red-500">*</sup>
            </FieldLabel>
            <Input
              id="login-email"
              name="login-email"
              type="email"
              pattern={SCHOOL_EMAIL_PATTERN}
              placeholder="surnameXXXXXXX@mls.ceu.edu.ph"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="login-password" className="flex gap-0">
              Password<sup className="text-red-500">*</sup>
            </FieldLabel>
            <PasswordInput
              id="login-password"
              name="login-password"
              placeholder="••••••••"
              required
            />
            <FieldError>{error}</FieldError>
            <Link className="text-end text-xs" href="/auth/forgot-password">
              Forgot Password?
            </Link>
          </Field>
          {unverified && <VerificationInstructions />}
          <Field>
						<Button size="lg" type="submit" disabled={submitting}>
							{
								submitting ?
									(
										<Spinner />
									)
									:
									(
										<>
											Log In to EscolarTrade <ArrowRight />
										</>
									)
							}
						</Button>
					</Field>
				</FieldGroup>
			</FieldSet>
		</form>
	)
}
