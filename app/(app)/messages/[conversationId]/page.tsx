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
import { TriangleAlert } from "lucide-react";

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
      </MessageScrollerProvider>
    </section>
  );
}
