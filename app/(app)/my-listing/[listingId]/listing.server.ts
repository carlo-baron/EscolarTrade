"use server"

import { z } from "zod"

import { requireSession } from "@/lib/auth/session"
import { adminDb } from "@/lib/firebase-admin"
import {
  UpdateListingSchema,
  type UpdateListingInput,
} from "@/schemas/listing.schema"

import { updateListingForOwner } from "./listing-update.service"

export async function updateListing(
  listingId: string,
  payload: UpdateListingInput
) {
  const { uid } = await requireSession()
  const validation = UpdateListingSchema.safeParse(payload)

  if (!validation.success) {
    return {
      success: false,
      errors: z.flattenError(validation.error).fieldErrors,
    } as const
  }

  try {
    await updateListingForOwner({
      firestore: adminDb,
      listingId,
      ownerId: uid,
      input: validation.data,
    })

    return { success: true } as const
  } catch {
    return {
      success: false,
      error: "Unable to save changes to your listing.",
    } as const
  }
}
