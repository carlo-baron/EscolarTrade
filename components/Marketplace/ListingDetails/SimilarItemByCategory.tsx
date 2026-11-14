import { Category } from "@/types/market.types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MARKETPLACE_LISTINGS } from "@/data/sample-listings";
import { ListingCard } from "../ListingCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { ListingType } from "@/schemas/listing.schema";

export function SimilarItemByCategory({ listing } : { listing: ListingType }){
	return(
		<section className="similar-listing">
			<div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
				<h2 className="text-2xl font-bold">Similar in {listing.category}</h2>			
				<Link className="items-center gap-2 flex text-sm" href={`/marketplace?category=${encodeURIComponent(listing.category)}`}>
					View all in {listing.category}
					<ArrowRight size={14}/>
				</Link>
			</div>
			<div className="hidden mt-4 gap-4 sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{
					MARKETPLACE_LISTINGS
					.slice(0, 4)
					.map(item => {
						return(<ListingCard key={item.id} listing={item}/>)
					})
				}
			</div>
			<Carousel className="mt-4 sm:hidden">
				<CarouselContent>
					{
						MARKETPLACE_LISTINGS
						.slice(0, 4)
						.map(item => {
							return(
								<CarouselItem key={item.id}>
									<ListingCard listing={item}/>
								</CarouselItem>
							)
						})
					}
				</CarouselContent>
			</Carousel>
		</section>
	);
}
