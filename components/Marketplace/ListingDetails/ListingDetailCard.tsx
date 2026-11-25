"use client";

import { MessageSquareText, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Separator } from "@/components/ui/separator";
import { listingStatusColor } from "@/types/market.types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { ListingDetailedType } from "@/schemas/listing.schema";
import { LikeButton } from "../LikeButton";
import { useState } from "react";
import { likeListing } from "@/app/(app)/marketplace/like.server";
import { toast } from "sonner";
import { useConversation } from "@/hooks/marketplace/conversation.hook";
import { useRouter } from "next/navigation";

export function ListingDetailCard({ listing } : { listing: ListingDetailedType }){
	const [isLiked, setIsLiked]	= useState(listing.isLiked);
	const getConversation = useConversation();
	const router = useRouter();

	async function handleLikeListing(state: boolean){
		setIsLiked(state);

		try{
			const like = await likeListing(listing.id);
			setIsLiked(like.isLiked);
		}catch {
			toast.error("Could not like this listing. Please try again.")
			setIsLiked(!state);
		}
	}

	async function handleMessageSeller(){
		try{
			const conversation = await getConversation(listing.id);
			if(conversation.success){
				router.push(`/messages/${conversation.conversationId}`);
				return;
			}
			toast.error(conversation.message);
		}catch{
			toast.error("Something went wrong.");
		}
	}

	return(
		<div className="lg:max-w-[40%] w-full flex flex-col gap-4">
			<Card>
				<CardHeader>
					<div className="font-medium flex justify-between">
						<p className="uppercase text-muted-foreground text-xs">{listing.category}</p>
						<Button variant="ghost" size="icon-sm">
							<Flag className="text-muted-foreground"/>
						</Button>
					</div>
					<CardTitle className="text-2xl lg:text-4xl font-extrabold">{listing.title}</CardTitle>
					<div className="items-center flex justify-between">
						<p className="font-semibold text-base lg:text-xl">₱{listing.priceCentavos / 100}</p>
						<Badge variant="secondary">
							<span className={`rounded-full aspect-square w-2 ${listingStatusColor[listing.status]}`}></span>
							{listing.status}
						</Badge>
					</div>
				</CardHeader>
				<Separator />
				<CardContent>
					<p className="text-sm lg:text-base mb-4">{listing.description}</p>
					<p className="uppercasefont-medium text-muted-foreground mb-2">Meetup Spots</p>
					<div className="spots flex flex-wrap gap-2">
						{
							listing.meetupLocations.map(item => {
								return(
									<Badge className="px-4 py-2 rounded-xs text-lg" key={item}>{item}</Badge>
								);
							})
						}
					</div>
					<Marker>
						<MarkerContent><i>Final spot and time are agreed in chat.</i></MarkerContent>
					</Marker>
				</CardContent>
				<CardFooter className="flex-col">
					<div className="w-full flex gap-2">
						<Button className="flex-1" size="lg" onClick={handleMessageSeller}>
							<MessageSquareText />
							Message Seller</Button>
						<LikeButton 
							variant="outline"
							className="aspect-square"
							size="lg"
							like={isLiked}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								handleLikeListing(!isLiked)
							}} 
						/>
					</div>
					<Marker className="flex justify-center text-xs">
						<MarkerContent>Pay in person at the meetup.</MarkerContent>
					</Marker>
				</CardFooter>
			</Card>
			<Item variant="outline">
				<ItemMedia>
					<Avatar>
						<AvatarImage src={listing.seller?.displayName}/>
						<AvatarFallback>BR</AvatarFallback>
					</Avatar>
				</ItemMedia>
				<ItemContent>
					<ItemTitle>{listing.seller?.displayName}</ItemTitle>
					<ItemDescription>{listing.seller?.program}</ItemDescription>
				</ItemContent>
				<ItemActions>
					<Link href="/seller-profile">View Profile</Link>
				</ItemActions>
			</Item>
		</div>
	);
}
