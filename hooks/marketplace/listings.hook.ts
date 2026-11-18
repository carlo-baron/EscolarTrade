import "server-only";

import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireSession } from "@/lib/auth/session";
import {
  ListingSchema,
  ListingWithLikeStateSchema,
  type ListingDetailedType,
} from "@/schemas/listing.schema";

interface ListingFilter {
  search?: string;
  category?: string;
  zone?: string;
  condition?: string;
  min?: string;
  max?: string;
}

type PublicSeller = {
  displayName: string;
  program?: string;
};

const PAGE_SIZE = 8;
const SCAN_SIZE = 50;

function parsePesoFilter(value?: string): number | undefined | null {
  if (!value?.trim()) return undefined;

  const pesos = Number(value);
  if (!Number.isFinite(pesos) || pesos < 0) return null;

  return Math.round(pesos * 100);
}

function parseListing(doc: QueryDocumentSnapshot) {
  const data = doc.data();

  return ListingSchema.parse({
    id: doc.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    publishedAt: data.publishedAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    priceChangedAt: data.priceChangedAt?.toDate() ?? null,
    soldAt: data.soldAt?.toDate() ?? null,
  });
}

//TODO: study how this works
export async function getListings(
  filter: ListingFilter
): Promise<ListingDetailedType[]> {
  const { uid } = await requireSession();

  const searchWords =
    filter.search?.toLowerCase().match(/[a-z0-9]+/g) ?? [];

  const searchTokens = [
    ...new Set(searchWords.map((word) => word.slice(0, 30))),
  ].slice(0, 15);

  const minCentavos = parsePesoFilter(filter.min);
  const maxCentavos = parsePesoFilter(filter.max);

  if (
    minCentavos === null ||
    maxCentavos === null ||
    (minCentavos !== undefined &&
      maxCentavos !== undefined &&
      minCentavos > maxCentavos)
  ) {
    return [];
  }

  let query = adminDb
    .collection("listings")
    .where("moderationStatus", "==", "visible")
    .where("status", "in", ["Available", "Pending"]);

  if (filter.category) {
    query = query.where("category", "==", filter.category);
  }

  if (filter.condition) {
    query = query.where("condition", "==", filter.condition);
  }

  if (searchTokens.length > 0) {
    query = query.where("searchTokens", "array-contains-any", searchTokens);
  } else if (filter.zone) {
    query = query.where("meetupLocations", "array-contains", filter.zone);
  }

  const listings = [];
  let lastDoc: QueryDocumentSnapshot | undefined;

  while (listings.length < PAGE_SIZE) {
    let batchQuery = query
      .orderBy("createdAt", "desc")
      .limit(SCAN_SIZE);

    if (lastDoc) {
      batchQuery = batchQuery.startAfter(lastDoc);
    }

    const snapshot = await batchQuery.get();
    if (snapshot.empty) break;

    for (const doc of snapshot.docs) {
      lastDoc = doc;
      const data = doc.data();

      if (
        filter.zone &&
        !data.meetupLocations?.includes(filter.zone)
      ) {
        continue;
      }

      if (
        minCentavos !== undefined &&
        data.priceCentavos < minCentavos
      ) {
        continue;
      }

      if (
        maxCentavos !== undefined &&
        data.priceCentavos > maxCentavos
      ) {
        continue;
      }

      listings.push(parseListing(doc));

      if (listings.length === PAGE_SIZE) break;
    }

    if (snapshot.size < SCAN_SIZE) break;
  }

  if (listings.length === 0) return [];

  const sellerIds = [...new Set(listings.map((listing) => listing.sellerId))];
  const sellerRefs = sellerIds.map((id) =>
    adminDb.collection("users").doc(id)
  );
  const likeRefs = listings.map((listing) =>
    adminDb.collection("users").doc(uid).collection("likes").doc(listing.id)
  );

  const [sellerSnapshots, likeSnapshots] = await Promise.all([
    adminDb.getAll(...sellerRefs),
    adminDb.getAll(...likeRefs),
  ]);

  const sellersById = new Map<string, PublicSeller | null>();

  for (const snapshot of sellerSnapshots) {
    if (!snapshot.exists) {
      sellersById.set(snapshot.id, null);
      continue;
    }

    const data = snapshot.data()!;
    sellersById.set(snapshot.id, {
      displayName: data.displayName,
      program: data.program,
    });
  }

  const likedIds = new Set(
    likeSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => snapshot.id)
  );

  return listings.map((listing) =>
    ListingWithLikeStateSchema.parse({
      ...listing,
      seller: sellersById.get(listing.sellerId) ?? null,
      isLiked: likedIds.has(listing.id),
    })
  );
}

export async function getListing(
  slug: string
): Promise<ListingDetailedType | null> {
  const { uid } = await requireSession();

  const listingSnapshot = await adminDb
    .collection("listings")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  const doc = listingSnapshot.docs[0];
  if (!doc) return null;

  const data = doc.data();

  if (
    data.moderationStatus !== "visible" ||
    !["Available", "Pending"].includes(data.status)
  ) {
    return null;
  }

  const listing = parseListing(doc);

  const [sellerSnapshot, likeSnapshot] = await Promise.all([
    adminDb.collection("users").doc(listing.sellerId).get(),
    adminDb.collection("users").doc(uid).collection("likes").doc(listing.id).get(),
  ]);

  const sellerData = sellerSnapshot.data();

  return ListingWithLikeStateSchema.parse({
    ...listing,
    seller: sellerData
      ? {
          displayName: sellerData.displayName,
          program: sellerData.program,
        }
      : null,
    isLiked: likeSnapshot.exists,
  });
}
