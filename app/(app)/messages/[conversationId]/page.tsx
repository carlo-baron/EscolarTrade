import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item"
import { SAMPLE_CHAT } from "@/data/sample-conversations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
	Message,
	MessageAvatar,
	MessageContent,
	MessageFooter,
	MessageHeader,
} from "@/components/ui/message";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { SendHorizontal, SquareArrowOutUpRight, TriangleAlert } from "lucide-react";
import { listingStatuses } from "@/types/market.types";

interface ConversationProps {
	params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({
	params,
}: ConversationProps) {
	const { conversationId } = await params;
	const chat = SAMPLE_CHAT;

	const otherParticipant = chat.participants.find(participant => participant.id !== chat.currentUserId);

	return (
		<section className="
			flex justify-center h-full flex-1 flex-col py-4
			">
			<MessageScrollerProvider
				key={conversationId}
				defaultScrollPosition="end"
				autoScroll
			>
				<div className="head">
					<Item>
						<ItemMedia variant="icon">
							<Avatar>
								<AvatarFallback>
									{otherParticipant?.name
										.split(" ")
										.map(word => word[0])
										.join("")
										.toUpperCase() ?? "UK"
									}
								</AvatarFallback>
							</Avatar>
						</ItemMedia>
						<ItemContent>
							<ItemTitle>{otherParticipant?.name ?? "EscolarTrade User"}</ItemTitle>
							<ItemDescription>BSN</ItemDescription>
						</ItemContent>
						<ItemActions>
							<Button size="icon-lg" variant="ghost"><TriangleAlert /></Button>
						</ItemActions>
					</Item>

					<ChatItemDetail listing={chat.listing} seller/>
				</div>
				<MessageScroller className="min-h-0 flex-1">
					<MessageScrollerViewport>
						<MessageScrollerContent className="flex flex-col gap-4 p-4">
							{chat.messages.map((message) => {
								const isOwnMessage =
									message.senderId === chat.currentUserId;

								const sender = chat.participants.find(
									(participant) => participant.id === message.senderId
								);

								const alignment = isOwnMessage ? "end" : "start";

								return (
									<MessageScrollerItem
										key={message.id}
										messageId={message.id}
									>
										<Message align={alignment}>
											<MessageAvatar>
												<Avatar>
													<AvatarFallback>
														{sender?.initials ?? "?"}
													</AvatarFallback>
												</Avatar>
											</MessageAvatar>

											<MessageContent className="min-w-0">
												<MessageHeader>
													{isOwnMessage ? "You" : sender?.name ?? "Unknown"}
												</MessageHeader>

												<Bubble
													align={alignment}
													variant={isOwnMessage ? "default" : "secondary"}
												>
													<BubbleContent className="whitespace-pre-wrap wrap-break-words">
														{message.content}
													</BubbleContent>
												</Bubble>

												<MessageFooter className="text-xs text-muted-foreground">
													{message.time}
												</MessageFooter>
											</MessageContent>
										</Message>
									</MessageScrollerItem>
								);
							})}
						</MessageScrollerContent>
					</MessageScrollerViewport>

					<MessageScrollerButton />
				</MessageScroller>

				<div className="px-4 foot send">
					<form className="flex gap-2 items-end">
						<InputGroup>
							<InputGroupTextarea
								id="block-end-textarea"
								className="max-h-20"
								placeholder="Write a comment..."
								maxLength={300}
							/>
							<InputGroupAddon align="block-end">
								<InputGroupText>0/300</InputGroupText>
								<InputGroupButton type="submit" variant="default" size="sm" className="ml-auto">
									<SendHorizontal />
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
					</form>
				</div>
			</MessageScrollerProvider>
		</section>
	);
}

interface ChatItemDetailProps {
	listing: {
		id: string;
		image: string;
		slug: string;
		title: string;
		status: string;
		price: number;
	}
	seller?: boolean;
}

function ChatItemDetail({listing, seller = false} : ChatItemDetailProps){
	const statuses = listingStatuses.map(status => ({
		label: status,
		value: status
	}));

	return(
		<Item className="bg-muted rounded-none">
			<ItemMedia variant="icon">
				<img
					className="w-10 aspect-square"
					src={listing.image} alt={listing.title} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>{listing.title}</ItemTitle>
				<ItemDescription className="text-foreground font-medium">₱{listing.price}</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button variant="outline">View Listing <SquareArrowOutUpRight /> </Button>
				{
					seller &&
						(
							<div className="flex items-center gap-2">
								<p className="text-muted-foreground">Status:</p>

								<Select items={statuses} defaultValue={listing.status}>
									<SelectTrigger>
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{statuses.map((item) => (
												<SelectItem key={item.value} value={item.value}>
													{item.label}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						)
				}
			</ItemActions>
		</Item>
	);
}
