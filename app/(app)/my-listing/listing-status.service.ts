import "server-only"

import { FieldValue, type Firestore } from "firebase-admin/firestore"

import type { ListingStatus } from "@/types/market.types"

type UpdateListingStatusForOwnerParams = {
  firestore: Firestore
  listingId: string
  ownerId: string
  status: ListingStatus
}

export async function updateListingStatusForOwner({
  firestore,
  listingId,
  ownerId,
  status,
}: UpdateListingStatusForOwnerParams) {
  const listingRef = firestore.collection("listings").doc(listingId)

  await firestore.runTransaction(async (transaction) => {
    const listingSnapshot = await transaction.get(listingRef)
    const listing = listingSnapshot.data()

    if (!listingSnapshot.exists || listing?.sellerId !== ownerId) {
      throw new Error("Listing not found.")
    }

    if (listing.status === "Sold") {
      throw new Error("Sold listings cannot be reopened.")
    }

    if (listing.status === status) return

    transaction.update(listingRef, {
      status,
      ...(status === "Sold" && { soldAt: FieldValue.serverTimestamp() }),
      updatedAt: FieldValue.serverTimestamp(),
    })
  })
}
