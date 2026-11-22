import "server-only";

import {
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireListingOwner, requireSession } from "@/lib/auth/session";
import {
  ListingSchema,
  ListingType,
  ListingWithLikeStateSchema,
  type ListingDetailedType,
} from "@/schemas/listing.schema";
import { categories, Category } from "@/types/market.types";

interface ListingFilter {
  search?: string;
  category?: string;
  zone?: string;
  condition?: string;
  min?: string;
  max?: string;
}

export type MarketplaceListingFilter = ListingFilter;

const PAGE_SIZE = 8;

function parsePesoFilter(value?: string): number | undefined | null {
  if (!value?.trim()) return undefined;

  const pesos = Number(value);
  if (!Number.isFinite(pesos) || pesos < 0) return null;

  return Math.round(pesos * 100);
}

function parseListing(doc: QueryDocumentSnapshot | DocumentSnapshot) {
  const data = doc.data();
  if (!data) throw new Error("Listing not found.");

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

export async function getListings(
  filter: ListingFilter,
  after?: string
): Promise<{ listings: ListingDetailedType[]; nextCursor: string | null }> {
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
    return { listings: [], nextCursor: null };
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
  }

  if (filter.zone) query = query.where("meetupLocations", "array-contains", filter.zone);
  if (minCentavos !== undefined) query = query.where("priceCentavos", ">=", minCentavos);
  if (maxCentavos !== undefined) query = query.where("priceCentavos", "<=", maxCentavos);
  query = query.orderBy("createdAt", "desc");
  if (after) {
    const cursor = await adminDb.collection("listings").doc(after).get();
    if (cursor.exists) query = query.startAfter(cursor);
  }

  const snapshot = await query.limit(PAGE_SIZE + 1).get();
  const hasMore = snapshot.docs.length > PAGE_SIZE;
  const docs = snapshot.docs.slice(0, PAGE_SIZE);
  const listings = docs.map(parseListing);
  if (!listings.length) return { listings: [], nextCursor: null };

  const likeRefs = listings.map((listing) =>
    adminDb
      .collection("users")
      .doc(uid)
      .collection("likes")
      .doc(listing.id)
  );

  const likeSnapshots = await adminDb.getAll(...likeRefs);
  const likedIds = new Set(
    likeSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => snapshot.id)
  );

  const results = listings.map((listing) =>
    ListingWithLikeStateSchema.parse({
      ...listing,
      isLiked: likedIds.has(listing.id),
    })
  );
  return { listings: results, nextCursor: hasMore ? docs.at(-1)!.id : null };
}

export async function getListingBySlug(
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
  const likeSnapshot = await adminDb
    .collection("users")
    .doc(uid)
    .collection("likes")
    .doc(listing.id)
    .get();

  return ListingWithLikeStateSchema.parse({
    ...listing,
    isLiked: likeSnapshot.exists,
  });
}

export async function getListingByIdForEdit(
  listingId: string
): Promise<ListingType | null> {
  const { listing } = await requireListingOwner(listingId);
  return parseListing(listing);
}

// pick a random category and get the top liked listing
export async function getFeaturedListing(){
	const randomCategory = categories[Math.floor(Math.random() * categories.length)];

	const snapshot = await adminDb
		.collection("listings")
		.where("moderationStatus", "==", "visible")
		.where("status", "in", ["Available", "Pending"])
		.where("category", "==", randomCategory)
		.orderBy("likeCount", "desc")
		.limit(1)
		.get();

	return snapshot.docs.map(parseListing)[0];
}

async function getTopLikedListingsByCategory(category: Category | null){
	let query = adminDb
	.collection("listings")
	.where("moderationStatus", "==", "visible")
	.where("status", "in", ["Available", "Pending"]);

	if(category !== null){
		query = query.where("category", "==", category);
	}

	const snapshot = await query
		.orderBy("likeCount", "desc")
		.limit(4)
		.get();

	return snapshot.docs.map(parseListing);
}

export async function getRecommendedListings(category: Category | null){
	const { uid } = await requireSession();

	const listings = await getTopLikedListingsByCategory(category);

  const likeRefs = listings.map((listing) =>
    adminDb
      .collection("users")
      .doc(uid)
      .collection("likes")
      .doc(listing.id)
  );

  const likeSnapshots = await adminDb.getAll(...likeRefs);
  const likedIds = new Set(
    likeSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => snapshot.id)
  );

  const results = listings.map((listing) =>
    ListingWithLikeStateSchema.parse({
      ...listing,
      isLiked: likedIds.has(listing.id),
    })
  );

	return {
		success: true,
		message: "Recommended listings fetched successfully",
		listings: results
	};
}

export async function getMarketplaceSnippet(category: Category | null){
	const listings = await getTopLikedListingsByCategory(category);

  const results = listings.map((listing) =>
    ListingWithLikeStateSchema.parse({
      ...listing,
      isLiked: false,
    })
  );

	return {
		success: true,
		message: "Marketplace snippet fetched successfully",
		listings: results
	};
}
