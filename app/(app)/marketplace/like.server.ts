"use server";

import { requireSession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase-admin";

export async function likeListing(listingId: string) {
  const { uid } = await requireSession();

  const likesRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("likes")
    .doc(listingId);

  const listingRef = adminDb.collection("listings").doc(listingId);

  return adminDb.runTransaction(async (transaction) => {
    const [likeSnapshot, listingSnapshot] = await Promise.all([
      transaction.get(likesRef),
      transaction.get(listingRef),
    ]);

    if (likeSnapshot.exists) {
      transaction.delete(likesRef);

      if (listingSnapshot.exists) {
        const currentCount = listingSnapshot.data()?.likeCount;
        const count =
          typeof currentCount === "number" && Number.isFinite(currentCount)
            ? Math.max(0, Math.floor(currentCount))
            : 0;

        transaction.update(listingRef, {
          likeCount: Math.max(0, count - 1),
        });
      }

      return {
        success: true,
        isLiked: false,
        message: "Listing unliked successfully!",
      };
    }

    if (!listingSnapshot.exists) {
      return {
        success: false,
        isLiked: false,
        message: "Listing not found.",
      };
    }

    const currentCount = listingSnapshot.data()?.likeCount;
    const count =
      typeof currentCount === "number" && Number.isFinite(currentCount)
        ? Math.max(0, Math.floor(currentCount))
        : 0;

    transaction.create(likesRef, {
      createdAt: new Date(),
    });

    transaction.update(listingRef, {
      likeCount: count + 1,
    });

    return {
      success: true,
      isLiked: true,
      message: "Listing liked successfully!",
    };
  });
}
