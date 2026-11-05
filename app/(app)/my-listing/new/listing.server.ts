"use server";
import { requireSession } from "@/lib/auth/session";
import { CreateListingInput, CreateListingSchema } from "@/schemas/listing.schema";
import { z } from 'zod';

export async function createListing(payload: CreateListingInput){
	const session = await requireSession();

	const result = CreateListingSchema.safeParse(payload);
	if(!result.success){
		return {
			success: false,
			errors: z.flattenError(result.error).fieldErrors,
		};
	}
}
