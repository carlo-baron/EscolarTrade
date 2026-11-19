import "server-only"

import type { Firestore } from "firebase-admin/firestore"

type DeleteSoldListingForOwnerParams = {
  firestore: Firestore
  listingId: string
  ownerId: string
}

export async function deleteSoldListingForOwner({
  firestore,
  listingId,
  ownerId,
}: DeleteSoldListingForOwnerParams) {
  const listingRef = firestore.collection("listings").doc(listingId)

  await firestore.runTransaction(async (transaction) => {
    const listingSnapshot = await transaction.get(listingRef)
    const listing = listingSnapshot.data()

    if (!listingSnapshot.exists || listing?.sellerId !== ownerId) {
      throw new Error("Listing not found.")
    }

    if (listing.status !== "Sold") {
      throw new Error("Only sold listings can be deleted.")
    }

    transaction.delete(listingRef)
  })
}
