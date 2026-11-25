"use client";

import { useCallback } from "react";
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { useGetUser } from "../zustand/auth.store";
import { db } from "@/lib/firebase";
import { ListingSchema } from "@/schemas/listing.schema";
import { ConversationSchema } from "@/schemas/conversation.schema";

export const useConversation = () => {
	const user = useGetUser();

	return useCallback(async (listingId: string) => {
		if(!user){
			return {
				success: false,
				message: "User not found! Please login."
			}
		}
		const listingRef = doc(db, "listings", listingId);
		const listingSnap = await getDoc(listingRef);
		if(!listingSnap.exists()){
			return{
				success: false,
				message: "Listing not found!"
			};
		}

		const listing = ListingSchema.parse({
			id: listingSnap.id,
			...listingSnap.data(),
			createdAt: listingSnap.data().createdAt.toDate(),
			publishedAt: listingSnap.data().publishedAt.toDate(),
			updatedAt: listingSnap.data().updatedAt.toDate(),
			priceChangedAt: listingSnap.data().priceChangedAt?.toDate() ?? null,
			soldAt: listingSnap.data().soldAt?.toDate() ?? null,
		});

		if (listing.sellerId === user.uid) {
			return { success: false, message: "You can't message yourself on your own listing." };
		}
		if (listing.moderationStatus !== "visible" || !["Available", "Pending"].includes(listing.status)) {
			return { success: false, message: "This listing is no longer accepting inquiries." };
		}

		const conversationRef = doc(db, "conversations", `${listingId}_${user.uid}`);
		const conversationSnap = await getDoc(conversationRef);

		if(conversationSnap.exists()){
			return {
				success: true,
				message: "Conversation fetched successfully",
				conversationId: `${listingId}_${user.uid}`
			}
		}

		const payload = {
			listingId,
			buyerId: user.uid,
			sellerId: listing.sellerId,
			participants: [user.uid, listing.sellerId],
			listingSnapshot: {
				title: listing.title,
				image: listing.images[0],
				slug: listing.slug,
				status: listing.status,
				priceCentavos: listing.priceCentavos,
				seller: listing.seller,
			},
			createdAt: serverTimestamp(),
			lastMessageAt: null,
			lastMessage: null,
		}

		await setDoc(conversationRef, payload);
		return {
			success: true,
			message: "New conversation created successfully!",
			conversationId: conversationRef.id
		};
	}, [user]);
}

export const useListConversations = () => {
	const user = useGetUser();

	return useCallback(async () => {
		if(!user){
			return {
				success: false,
				message: "User not found! Please login."
			}
		}

		const conversationsRef = collection(db, "conversations");
		const q = query(
			conversationsRef,
			where("participants", "array-contains", user.uid),
			limit(50)
		);

		const conversationsSnap = await getDocs(q);

		const conversations = conversationsSnap.docs.map((doc) => ConversationSchema.parse({
			id: doc.id,
			...doc.data(),
			createdAt: doc.data().createdAt.toDate()
		}));

		return {
			success: true,
			message: "Conversations fetched successfully!",
			conversations
		}
	}, [user]);
}
