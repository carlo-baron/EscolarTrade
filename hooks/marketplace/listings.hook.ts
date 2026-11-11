import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/auth/session";
import { ListingSchema, ListingWithSellerDetails } from "@/schemas/listing.schema";

type PublicSeller = {
  displayName: string;
  program: string;
};

export async function getListings() {
  await requireSession();

  const listingSnapshot = await adminDb
    .collection("listings")
    .where("moderationStatus", "==", "visible")
    .where("status", "in", ["Available", "Pending"])
    .orderBy("createdAt", "desc")
    .limit(8)
    .get();

  const listings = listingSnapshot.docs.map((doc) =>
    ListingSchema.parse({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      publishedAt: doc.data().publishedAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      priceChangedAt: doc.data().priceChangedAt?.toDate() ?? null,
      soldAt: doc.data().soldAt?.toDate() ?? null,
    })
  );

  const sellerIds = [...new Set(listings.map((listing) => listing.sellerId))];
  const sellerRefs = sellerIds.map((id) => adminDb.collection("users").doc(id));
  const sellerSnapshots = await adminDb.getAll(...sellerRefs);

  const sellersById = new Map<string, PublicSeller | null>(
    sellerSnapshots.map((snapshot) => {
      if (!snapshot.exists) return [snapshot.id, null];

      const data = snapshot.data()!;
      return [
        snapshot.id,
        {
          displayName: data.displayName,
          program: data.program,
        },
      ];
    })
  );

  return listings.map((listing) => (
		ListingWithSellerDetails.parse({
    ...listing,
    seller: sellersById.get(listing.sellerId) ?? null,
  })));
}
