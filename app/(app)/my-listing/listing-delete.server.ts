"use server"

import { requireSession } from "@/lib/auth/session"
import { adminDb } from "@/lib/firebase-admin"

import { deleteSoldListingForOwner } from "./listing-delete.service"

export async function deleteSoldListing(listingId: string) {
  const { uid } = await requireSession()

  try {
    await deleteSoldListingForOwner({
      firestore: adminDb,
      listingId,
      ownerId: uid,
    })

    return { success: true } as const
  } catch {
    return {
      success: false,
      error: "Unable to delete the listing.",
    } as const
  }
}
