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
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useListConversations } from "@/hooks/marketplace/conversation.hook";
import { ConversationType } from "@/schemas/conversation.schema";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty"

type ChatFilter = "all" | "buying" | "selling" | "unread"

export function ConversationList() {
	const [selectedConversation, setSelectedConversation] =
	useState<string>("");
	const [chatFilter, setChatFilter] = useState<ChatFilter>("all");
	const [conversationList, setConversationList] = useState<ConversationType[]>([]);
	const listConversations = useListConversations();

	useEffect(() => {
		async function getConversations(){
			const data = await listConversations();
			if(data.success){
				setConversationList(data.conversations as ConversationType[]);
			}
		}

		getConversations();
	}, [listConversations]);

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
					{conversationList.length > 0 ?
						conversationList.map((conversation) => (
							<ConversationItem
								key={conversation.id}
								conversation={conversation}
								selected={selectedConversation}
								onSelectAction={setSelectedConversation}
							/>
						))
						:
						(
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Users />	
									</EmptyMedia>
									<EmptyTitle>No conversations</EmptyTitle>
									<EmptyDescription>No conversations found</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
								</EmptyContent>
							</Empty>
						)
					}
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
		conversation: ConversationType, 
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
						<AvatarFallback>{conversation.listingSnapshot.seller.displayName[0]}</AvatarFallback>
					</Avatar>
				</ItemMedia>		
				<ItemContent>
					<div className="flex justify-between items-center">
						<ItemTitle>{conversation.listingSnapshot.seller.displayName}</ItemTitle>
						<p className="text-muted-foreground text-xs">{conversation.lastMessageAt?.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' }) ?? conversation.createdAt.toLocaleTimeString('en-us', { hour: '2-digit', minute: '2-digit' })}</p>
					</div>
					<p className="text-xs">{conversation.listingSnapshot.title}</p>
					<ItemDescription className="line-clamp-1">{conversation.lastMessage ?? "No messages yet"}</ItemDescription>
				</ItemContent>
			</Item>
		</Link>
	);
}
