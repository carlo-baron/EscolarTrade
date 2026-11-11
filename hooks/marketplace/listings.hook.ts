import "server-only";

import { adminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/auth/session";
import { ListingSchema } from "@/schemas/listing.schema";

export async function getListings() {
  await requireSession();

  const snapshot = await adminDb
    .collection("listings")
    .where("moderationStatus", "==", "visible")
    .where("status", "in", ["Available", "Pending"])
    .orderBy("createdAt", "desc")
    .limit(8)
    .get();

		return snapshot.docs.map((doc) =>
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
}
