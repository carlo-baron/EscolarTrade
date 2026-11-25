"use client";

import { collection, documentId, getDocs, limit, query, where } from "firebase/firestore";
import { useGetUser } from "../zustand/auth.store";
import { db } from "@/lib/firebase";
import { ListingDetailedType, ListingWithLikeStateSchema } from "@/schemas/listing.schema";
import { useCallback } from "react";

export const useGetLikedListings = () => {
	const user = useGetUser();

	return useCallback(async (): Promise<ListingDetailedType[]> => {
		if(!user) {
			return [];
		}

		const likesRef = collection(db, "users", user.uid, "likes");
		const listingsRef = collection(db, "listings");

		const likesQuery = query(
			likesRef,
			limit(8)
		);
		const likesSnap = await getDocs(likesQuery);

		const listingIds = likesSnap.docs.map((doc) => doc.id);

		if(listingIds.length <= 0) return [];

		const listingsQuery = query(
			listingsRef,
			where(documentId(), "in", listingIds),
			where("moderationStatus", "==", "visible"),
			where("status", "in", ["Available", "Pending"]),
			limit(8)
		);
		const listingsSnap = await getDocs(listingsQuery);
		
		return listingsSnap.docs.map((doc) => (ListingWithLikeStateSchema.parse({
			id: doc.id,
			...doc.data(),
			createdAt: doc.data().createdAt.toDate(),
			publishedAt: doc.data().publishedAt.toDate(),
			updatedAt: doc.data().updatedAt.toDate(),
			priceChangedAt: doc.data().priceChangedAt?.toDate() ?? null,
			soldAt: doc.data().soldAt?.toDate() ?? null,
			isLiked: true
		})));
	}, [user]);
}
