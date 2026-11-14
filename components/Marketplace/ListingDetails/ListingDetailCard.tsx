import { Heart, MessageSquareText, Flag } from "lucide-react";
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

// TODO: actual creation time of item
export function ListingDetailCard({ listing } : { listing: ListingDetailedType }){
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
						<Button className="flex-1" size="lg">
							<MessageSquareText />
							Message Seller</Button>
						<Button className="aspect-square" size="lg" variant="outline"><Heart /></Button>
					</div>
					<Marker className="flex justify-center text-xs">
						<MarkerContent>Pay in person at the meetup.</MarkerContent>
					</Marker>
				</CardFooter>
			</Card>
			<Item variant="outline">
				<ItemMedia>
					<Avatar>
						<AvatarImage src={listing.seller.displayName}/>
						<AvatarFallback>BR</AvatarFallback>
					</Avatar>
				</ItemMedia>
				<ItemContent>
					<ItemTitle>{listing.seller.displayName}</ItemTitle>
					<ItemDescription>{listing.seller.program}</ItemDescription>
				</ItemContent>
				<ItemActions>
					<Link href="/seller-profile">View Profile</Link>
				</ItemActions>
			</Item>
		</div>
	);
}
