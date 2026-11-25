import { z } from "zod";
import { PROGRAMS } from "@/types/school.types";

export const ConversationSchema = z.strictObject({
	id: z.string(),
	listingId: z.string(),
	buyerId: z.string(),
	sellerId: z.string(),
	participants: z.array(z.string()),

	listingSnapshot: z.object({
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
	}),

	createdAt: z.date(),
	lastMessageAt: z.date().nullable(),
	lastMessage: z.string().nullable(),
});

export type ConversationType = z.infer<typeof ConversationSchema>;
