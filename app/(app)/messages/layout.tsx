import React from "react";
import { ConversationList } from "@/components/Messages/ConversationList";
import { Separator } from "@/components/ui/separator";

export default function MessagesLayout({ children } : { children: React.ReactNode }){
	return(
		<main className="snap-center flex px-8 h-screen">
			<ConversationList />	
			<Separator className="mx-4" orientation="vertical" />
			{children}
		</main>
	);
}
