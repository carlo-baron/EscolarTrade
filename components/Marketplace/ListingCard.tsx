"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ListingDetailedType } from "@/schemas/listing.schema"
import { LikeButton } from "./LikeButton"
import { useState } from "react"
import { toast } from "sonner"
import { likeListing } from "@/app/(app)/marketplace/like.server"

export function ListingCard({ listing } : { listing: ListingDetailedType }){
	const [isLiked, setIsLiked] = useState<boolean>(listing.isLiked);

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

	return(
		<Link href={`/marketplace/${listing.slug}`} >
			<Card className="h-full relative w-full pt-0">
				<div className='relative'>

					<LikeButton 
						like={isLiked}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();

							handleLikeListing(!isLiked);
						}} 
						className="absolute top-2 right-2 z-21"
					/>

					<Badge
						variant="secondary"
						className="absolute bottom-2 left-2 z-21"
					>{listing.condition}</Badge>
					<img
						src={listing.images[0]}
						alt={listing.title}
						className="relative z-20 aspect-video w-full object-cover"
					/>
				</div>
				<CardHeader>
					<div className="flex justify-between">
						<p className="text-xs text-muted-foreground">{listing.category}</p>
						<p className="font-semibold">₱{listing.priceCentavos / 100}</p>
					</div>
					<CardTitle className="line-clamp-1">{listing.title}</CardTitle>
					<CardDescription className="truncate">
						{listing.description}
					</CardDescription>
				</CardHeader>
				<CardFooter className="flex-1">
					<div className="text-xs flex justify-between w-full gap-2">
						<div className="flex items-center gap-1">
							<p className="text-sm font-medium truncate">{listing.seller.displayName}</p>
							<p className="text-muted-foreground">
								• {listing.seller.program}
							</p>
						</div>

						<div className="flex items-center min-w-0 flex-1 justify-end text-muted-foreground">
							<MapPin size={16} className="shrink-0" />
							<p className="truncate">
								{listing.meetupLocations[0]}
							</p>
						</div>
					</div>
				</CardFooter>			
			</Card>
		</Link>
	);
}
