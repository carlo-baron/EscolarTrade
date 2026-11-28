import { z } from "zod";
import { PROGRAMS } from "@/types/school.types";

export const ListingSnapshotSchema = z.strictObject({
	title: z.string(),
	image: z.string(),
	slug: z.string(),
	status: z.string(),
	priceCentavos: z.number(),
	seller: z.object({
		displayName: z
		.string()
		.trim()
		.min(2)
		.max(60),

		program: z
		.enum(PROGRAMS.map((program) => program.value))
	}),
})

export type ListingSnapshotType = z.infer<typeof ListingSnapshotSchema>;

export const ConversationSchema = z.strictObject({
	id: z.string(),
	listingId: z.string(),
	buyerId: z.string(),
	sellerId: z.string(),
	participants: z.array(z.string()),

	listingSnapshot: ListingSnapshotSchema,

	createdAt: z.date(),
	lastMessageAt: z.date(),
	lastMessage: z.string().nullable(),
});

export type ConversationType = z.infer<typeof ConversationSchema>;
