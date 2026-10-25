"use server";

import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { SignUpSchema } from "@/schemas/user.schema";
import { FieldValue } from "firebase-admin/firestore";

export async function signUp(formData: FormData) {
	const signUpData = {
		"full-name": formData.get("full-name"),
		email: formData.get("email"),
		program: formData.get("program"),
		"year-level": formData.get("year-level"),
		password: formData.get("password"),
		"confirm-password": formData.get("confirm-password"),
		tos: formData.get("tos") === "on",
	};

	const validation = SignUpSchema.safeParse(signUpData);

	if (!validation.success) {
		return {
			success: false,
			errors: z.flattenError(validation.error).fieldErrors,
		};
	}

	const data = validation.data;

	let uid: string | null = null;

	try {
		const user = await adminAuth.createUser({
			email: data.email,
			password: data.password,
			displayName: data["full-name"],
			emailVerified: false,
		});

		uid = user.uid;

		await adminDb.collection("users").doc(uid).set({
			displayName: data["full-name"],
			program: data.program,
			yearLevel: data["year-level"],
			bio: "",
			meetupLocations: [],
			createdAt: FieldValue.serverTimestamp(),
			updatedAt: FieldValue.serverTimestamp(),
		});

		return {
			success: true,
			message: "Account created successfully! Please verify email to continue.",
		};
	} catch (error) {
		if (uid) {
			await adminAuth.deleteUser(uid).catch(() => {});
		}

		const code =
			typeof error === "object" && error !== null && "code" in error
				? (error as { code: string }).code
				: null;

		if (code === "auth/email-already-exists") {
			return {
				success: false,
				errors: { email: ["An account with this email already exists."] },
			};
		}

		if (code === "auth/invalid-password") {
			return {
				success: false,
				errors: { password: ["Password must be at least 6 characters."] },
			};
		}

		return {
			success: false,
			errors: { form: ["Something went wrong. Please try again."] },
		};
	}
}
