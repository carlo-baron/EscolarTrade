"use client";

import { useCallback } from "react";
import {
	collection,
	getDocs,
	limit,
	query,
	startAfter,
	where,
	type QueryDocumentSnapshot,
} from "firebase/firestore";
import { useGetUser } from "../zustand/auth.store";
import { db } from "@/lib/firebase";
import { ListingSchema, type ListingType } from "@/schemas/listing.schema";

const PAGE_SIZE = 8;

export type MyListingsCursor = QueryDocumentSnapshot;

export const useGetMyListings = () => {
	const user = useGetUser();
	const userId = user?.uid;

	return useCallback(
		async (cursor?: MyListingsCursor | null): Promise<{
			listings: ListingType[];
			nextCursor: MyListingsCursor | null;
			hasMore: boolean;
		}> => {
			if (!userId) {
				return { listings: [], nextCursor: null, hasMore: false };
			}

			const listingsRef = collection(db, "listings");
			const listingsQuery = query(
				listingsRef,
				where("sellerId", "==", userId),
				where("moderationStatus", "==", "visible"),
				where("status", "in", ["Available", "Pending", "Sold", "Out of Stock"]),
				...(cursor ? [startAfter(cursor)] : []),
				limit(PAGE_SIZE + 1)
			);
			const listingsSnap = await getDocs(listingsQuery);
			const hasMore = listingsSnap.docs.length > PAGE_SIZE;
			const pageDocs = listingsSnap.docs.slice(0, PAGE_SIZE);
			const listings = pageDocs.map((doc) =>
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

			return {
				listings,
				nextCursor: hasMore ? pageDocs.at(-1) ?? null : null,
				hasMore,
			};
		},
		[userId]
	);
};
