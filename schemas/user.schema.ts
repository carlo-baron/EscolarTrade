import { z } from "zod"
import { PROGRAMS, YEAR_LEVELS } from "@/types/school.types"

import { isSchoolEmail, SCHOOL_EMAIL_DOMAIN } from "@/lib/auth/policy"
export { SCHOOL_EMAIL_DOMAIN } from "@/lib/auth/policy"

export const SignUpSchema = z
  .strictObject({
    "full-name": z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(60, "Full name must not exceed 60 characters."),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email address."))
      .refine(isSchoolEmail, `Use your @${SCHOOL_EMAIL_DOMAIN} email address.`),

    program: z.enum(
      PROGRAMS.map((program) => program.value),
      { error: "Select a valid degree program." }
    ),

    "year-level": z.enum(
      YEAR_LEVELS.map((year) => year.value),
      { error: "Select a valid year level." }
    ),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password must not exceed 128 characters."),

    "confirm-password": z
      .string()
      .min(1, "Confirm your password.")
      .max(128, "Password must not exceed 128 characters."),

    tos: z.literal(true, {
      error: "You must agree to the Terms of Service.",
    }),
  })
  .refine((data) => data.password === data["confirm-password"], {
    message: "Passwords do not match.",
    path: ["confirm-password"],
  })

export type SignupInput = z.infer<typeof SignUpSchema>
export type SignupErrors = z.core.$ZodFlattenedError<
  z.output<typeof SignUpSchema>
>["fieldErrors"] & { form?: string[] }
