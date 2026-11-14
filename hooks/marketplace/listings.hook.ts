import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/auth/session";
import { ListingDetailedType, ListingSchema, ListingType, ListingWithSellerDetails } from "@/schemas/listing.schema";

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

export async function getListing(slug: string): Promise<ListingDetailedType | null> {
	await requireSession();

	const listingSnapshot = await adminDb
		.collection("listings")
		.where("slug", "==", slug)
		.limit(1)
		.get();

	const doc = listingSnapshot.docs[0];

	if (!doc) {
		return null;
	}

	const rawListingData = doc.data();

	const listingData = ListingSchema.parse({
		id: doc.id,
		...rawListingData,
		createdAt: rawListingData.createdAt.toDate(),
		publishedAt: rawListingData.publishedAt.toDate(),
		updatedAt: rawListingData.updatedAt.toDate(),
		priceChangedAt: rawListingData.priceChangedAt?.toDate() ?? null,
		soldAt: rawListingData.soldAt?.toDate() ?? null,
	});

	const seller = await adminDb
	.collection("users")
	.doc(listingData.sellerId)
	.get();

	const sellerData = seller.data();

	if(!sellerData){
		return null;
	}


	const listingDataWithSeller = ListingWithSellerDetails.parse({
		...listingData,
		seller: {
			displayName: sellerData.displayName,
			program: sellerData.program	
		}
	});

	return listingDataWithSeller
}
