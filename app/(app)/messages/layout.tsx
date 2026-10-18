import React from "react";
import { ConversationList } from "@/components/Messages/ConversationList";
import { MessageScroller } from "@/components/Messages/MessageScroller";
import { Separator } from "@/components/ui/separator";

export default function MessagesLayout({ children } : { children: React.ReactNode }){
	return(
		<main id="messages-main" className="snap-start flex pl-8 h-screen">
			<MessageScroller />
			<ConversationList />	
			<Separator className="mx-4" orientation="vertical" />
			{children}
		</main>
	);
}
