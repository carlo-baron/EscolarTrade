"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function AuthErrorDetector(){
	const params = useSearchParams();
	const error = params.get("error");
	
	useEffect(() => {
		if(error === "unverified"){
			toast.error("Email Unverified!", {
				description: "Your email needs to be verified to continue login."
			})
		}
	}, [error]);

	return null;
}
