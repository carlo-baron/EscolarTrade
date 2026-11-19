import "server-only"

import { FieldValue, type Firestore } from "firebase-admin/firestore"

import type { ValidatedUpdateListingInput } from "@/schemas/listing.schema"

type UpdateListingForOwnerParams = {
  firestore: Firestore
  listingId: string
  ownerId: string
  input: ValidatedUpdateListingInput
}

function createSearchTokens(title: string) {
  const words = title.toLowerCase().match(/[a-z0-9]+/g) ?? []
  return [...new Set(words.map((word) => word.slice(0, 30)))].slice(0, 20)
}

export async function updateListingForOwner({
  firestore,
  listingId,
  ownerId,
  input,
}: UpdateListingForOwnerParams) {
  const listingRef = firestore.collection("listings").doc(listingId)

  await firestore.runTransaction(async (transaction) => {
    const listingSnapshot = await transaction.get(listingRef)
    const listing = listingSnapshot.data()

    if (!listingSnapshot.exists || listing?.sellerId !== ownerId) {
      throw new Error("Listing not found.")
    }

    if (!["Available", "Pending", "Out of Stock"].includes(listing.status)) {
      throw new Error("This listing can no longer be edited.")
    }

    const priceChanged = listing.priceCentavos !== input.priceCentavos

    transaction.update(listingRef, {
      ...input,
      searchTokens: createSearchTokens(input.title),
      ...(priceChanged && {
        previousPriceCentavos: listing.priceCentavos,
        priceChangedAt: FieldValue.serverTimestamp(),
      }),
      updatedAt: FieldValue.serverTimestamp(),
    })
  })
}
