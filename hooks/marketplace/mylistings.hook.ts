"use client";

import { useCallback } from "react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { useGetUser } from "../zustand/auth.store";
import { db } from "@/lib/firebase";
import { ListingSchema, ListingType } from "@/schemas/listing.schema";

export const useGetMyListings = () => {
	const user = useGetUser();
	const userId = user?.uid;

	return useCallback(async (): Promise<ListingType[]> => {
		if(!userId) {
			return [];
		}

		const listingsRef = collection(db, "listings");


		const listingsQuery = query(
			listingsRef,
			where("sellerId", "==", userId),
			where("moderationStatus", "==", "visible"),
			where("status", "in", ["Available", "Pending", "Sold", "Out of Stock"]),
			limit(8)
		);
		const listingsSnap = await getDocs(listingsQuery);
		
		return listingsSnap.docs.map((doc) => (ListingSchema.parse({
			id: doc.id,
			...doc.data(),
			createdAt: doc.data().createdAt.toDate(),
			publishedAt: doc.data().publishedAt.toDate(),
			updatedAt: doc.data().updatedAt.toDate(),
			priceChangedAt: doc.data().priceChangedAt?.toDate() ?? null,
			soldAt: doc.data().soldAt?.toDate() ?? null,
		})));
	}, [userId])
}

