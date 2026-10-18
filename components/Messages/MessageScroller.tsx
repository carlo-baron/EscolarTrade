"use client";
import { useEffect } from "react";

export function MessageScroller(){
	useEffect(() => {
		const mainElement = document.getElementById("messages-main");

		if(!mainElement) return;

		mainElement.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});

	}, []);

	return(
		<></>
	);
}
