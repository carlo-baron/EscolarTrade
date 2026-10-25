"use client"

import { signUp } from "@/app/auth/signup.server"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldSet,
  FieldDescription,
  FieldContent,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PROGRAMS, YEAR_LEVELS } from "@/types/school.types"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "../ui/spinner"
import { useState } from "react"
import { SignupErrors } from "@/schemas/user.schema"
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import { clearSession } from "@/app/auth/session.server"
import { SCHOOL_EMAIL_PATTERN } from "@/lib/auth/policy"
import { VerificationInstructions } from "@/components/Auth/VerificationInstructions"

export function SignUpForm() {
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<SignupErrors>({})
  const [created, setCreated] = useState(false)

  async function handleSubmit(formData: FormData) {
    let accountCreated = false
    try {
      await clearSession()
      const result = await signUp(formData)

      if (!result.success) {
        setErrors(result.errors ?? {})
        return
      }
      accountCreated = true
      setCreated(true)

      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const credential = await signInWithEmailAndPassword(auth, email, password)

      try {
        await sendEmailVerification(credential.user)
        toast.success("Account Created!", {
          description: "Please visit your email provider to verify.",
        })
      } catch {
        toast.error(
          "Account created, but verification email could not be sent.",
          { description: "Use Resend verification email to try again." }
        )
      }
    } catch {
      toast.error(
        accountCreated
          ? "Account created, but automatic login failed. Log in to request a verification email."
          : "Unable to create your account. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {created ? (
        <VerificationInstructions />
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitting(true)
            setErrors({})
            const formData = new FormData(event.currentTarget)

            handleSubmit(formData)
          }}
        >
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel className="flex gap-0" htmlFor="full-name">
                  Full Name<sup className="text-red-500">*</sup>
                </FieldLabel>
                <Input
                  id="full-name"
                  name="full-name"
                  type="text"
                  placeholder="Juan Dela Cruz"
                  required
                />
                <FieldError>{errors?.["full-name"]}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="flex gap-0">
                  CEU Email Account<sup className="text-red-500">*</sup>
                </FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  pattern={SCHOOL_EMAIL_PATTERN}
                  placeholder="surnameXXXXXXX@mls.ceu.edu.ph"
                  required
                />
                <FieldError>{errors?.email}</FieldError>
              </Field>
              <div className="grid grid-rows-2 gap-2 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="program" className="flex gap-0">
                    Degree Program<sup className="text-red-500">*</sup>
                  </FieldLabel>
                  <Select id="program" name="program" items={PROGRAMS} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PROGRAMS.map((item) => {
                          return (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          )
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors?.program}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="year-level" className="flex gap-0">
                    Year Level<sup className="text-red-500">*</sup>
                  </FieldLabel>
                  <Select
                    id="year-level"
                    name="year-level"
                    items={YEAR_LEVELS}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {YEAR_LEVELS.map((item) => {
                          return (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          )
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{errors?.["year-level"]}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password" className="flex gap-0">
                    Create Password<sup className="text-red-500">*</sup>
                  </FieldLabel>
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                  />
                  <FieldError>{errors?.password}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password" className="flex gap-0">
                    Confirm Password<sup className="text-red-500">*</sup>
                  </FieldLabel>
                  <PasswordInput
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="••••••••"
                    required
                  />
                  <FieldError>{errors?.["confirm-password"]}</FieldError>
                </Field>
              </div>
              <Field orientation="horizontal">
                <Checkbox id="tos" name="tos" required />
                <FieldContent>
                  <FieldLabel htmlFor="tos">
                    I agree to Terms of Service
                  </FieldLabel>
                  <FieldDescription>
                    I agree to the EscolarTrade Terms of Service and trading
                    guidelines.
                  </FieldDescription>
                  <FieldError>{errors?.tos}</FieldError>
                </FieldContent>
              </Field>
              <Field>
                <FieldError>{errors.form}</FieldError>
                <Button size="lg" type="submit" disabled={submitting}>
                  {submitting ? (
                    <Spinner />
                  ) : (
                    <>
                      Create EscolarTrade Account
                      <ArrowRight />
                    </>
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      )}
    </>
  )
}
