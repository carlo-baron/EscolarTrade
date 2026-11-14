"use server";
import { requireProfile, requireSession } from "@/lib/auth/session";
import { CreateListingInput, CreateListingSchema } from "@/schemas/listing.schema";
import { z } from 'zod';
import slugify from "slugify";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export async function createListing(payload: CreateListingInput){
	const { uid } = await requireSession();
	const exists = await requireProfile(uid);
	if (!exists) {
		return { success: false, message: "No profile yet!", error: "Complete your profile first." } as const;
	}

	const result = CreateListingSchema.safeParse(payload);
	if(!result.success){
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}

	const rawData = result.data;

	const titleWords = rawData.title.toLowerCase().match(/[a-z0-9]+/g) ?? [];
	const searchTokens = [...new Set(titleWords.map((word) => word.slice(0, 30)))].slice(0, 20);
	const slug = slugify(rawData.title);

	try{
		const timestamp = FieldValue.serverTimestamp();
		const data = {
			...rawData,
			sellerId: uid,
			slug,
			searchTokens,
			status: "Available",
			initialPriceCentavos: rawData.priceCentavos,
			previousPriceCentavos: null,
			priceChangedAt: null,
			soldAt: null,
			moderationStatus: "visible",
			moderationVersion: 0,
			moderationReason: "",
			createdAt: timestamp,
			updatedAt: timestamp,
			publishedAt: timestamp
		};

		const listingRef = adminDb.collection("listings").doc();
		await listingRef.set(data);

		return {
			success: true,
			message: 'Listing created successfully!',
			listingId: listingRef.id,
			slug
		};
	}catch(error){
		throw error;
	}
}
