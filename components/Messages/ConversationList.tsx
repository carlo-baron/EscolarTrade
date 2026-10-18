"use client";

import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "cn";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
	ItemGroup
} from "@/components/ui/item"
import { ScrollArea } from "../ui/scroll-area";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { SAMPLE_CONVERSATIONS } from "@/data/sample-conversations";
import { Search } from "lucide-react";
import { Conversation } from "@/types/messages.type";
import { useState } from "react";

type ChatFilter = "all" | "buying" | "selling" | "unread"

export function ConversationList() {
	const [selectedConversation, setSelectedConversation] =
	useState<string>("");
	const [chatFilter, setChatFilter] = useState<ChatFilter>("all");

	return (
		<aside className="flex h-full min-h-0 w-[30%] shrink-0 flex-col py-4">
			<div className="shrink-0">
				<h1 className="mb-2 text-4xl font-bold">
					Messages
				</h1>

				<InputGroup className="mb-2">
					<InputGroupInput
						type="text"
						placeholder="Search conversations..."
					/>

					<InputGroupAddon>
						<Search />
					</InputGroupAddon>
				</InputGroup>

				<ToggleGroup
					variant="outline"
					defaultValue={["all"]}
					value={[chatFilter]}
					onValueChange={(val) => {
						if(!val) return;
						setChatFilter(val[0] as ChatFilter);
					}}
				>
					<ToggleGroupItem value="all">All</ToggleGroupItem>
					<ToggleGroupItem value="buying">Buying</ToggleGroupItem>
					<ToggleGroupItem value="selling">Selling</ToggleGroupItem>
					<ToggleGroupItem value="unread">Unread</ToggleGroupItem>
				</ToggleGroup>
			</div>

			<ScrollArea className="mt-4 min-h-0 flex-1">
				<ItemGroup className="gap-0">
					{SAMPLE_CONVERSATIONS.map((conversation) => (
						<ConversationItem
							key={conversation.id}
							conversation={conversation}
							selected={selectedConversation}
							onSelectAction={setSelectedConversation}
						/>
					))}
				</ItemGroup>
			</ScrollArea>
		</aside>
	);
}

export function ConversationItem({
	conversation,
	selected,
	onSelectAction,
} : 
	{
		conversation: Conversation, 
		selected: string,
		onSelectAction: (id: string) => void; 
	} ){
	return(
		<Link href={`/messages/${conversation.id}`}>
			<Item 
				onClick={() => onSelectAction(conversation.id)}
				className={cn("bg-background", selected === conversation.id && "bg-muted")}>
				<ItemMedia>
					<Avatar>
						<AvatarImage src={conversation.user.avatar} alt="@me" />
						<AvatarFallback>{conversation.user.initials}</AvatarFallback>
					</Avatar>
				</ItemMedia>		
				<ItemContent>
					<div className="flex justify-between items-center">
						<ItemTitle>{conversation.user.name}</ItemTitle>
						<p className="text-muted-foreground text-xs">{conversation.time}</p>
					</div>
					<p className="text-xs">{conversation.listing.title}</p>
					<ItemDescription className="line-clamp-1">{conversation.lastMessage}</ItemDescription>
				</ItemContent>
			</Item>
		</Link>
	);
}
