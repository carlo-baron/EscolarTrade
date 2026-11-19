"use server"

import { z } from "zod"

import { requireSession } from "@/lib/auth/session"
import { adminDb } from "@/lib/firebase-admin"
import { listingStatuses, type ListingStatus } from "@/types/market.types"

import { updateListingStatusForOwner } from "./listing-status.service"

const ListingStatusSchema = z.enum(listingStatuses)

export async function updateListingStatus(
  listingId: string,
  status: ListingStatus
) {
  const { uid } = await requireSession()
  const validation = ListingStatusSchema.safeParse(status)

  if (!validation.success) {
    return {
      success: false,
      error: "Choose a valid listing status.",
    } as const
  }

  try {
    await updateListingStatusForOwner({
      firestore: adminDb,
      listingId,
      ownerId: uid,
      status: validation.data,
    })

    return { success: true } as const
  } catch {
    return {
      success: false,
      error: "Unable to update the listing status.",
    } as const
  }
}
