import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ListingCard } from "../Marketplace/ListingCard";
import { getMarketplaceSnippet } from "@/lib/marketplace/listings.service";

export async function MarketplaceSnippet(){
	const recommendedListings = await getMarketplaceSnippet(null);

	return(
		<section id="market" className="border p-8 w-full flex flex-col">
			<p className="text-xs font-semibold uppercase text-muted-foreground">
				live marketplace	
			</p>
			<div className='mb-4 flex justify-between'>
				<h2 className="font-semibold text-2xl leading-none">
					Freshly Listed by Escolarians
				</h2>
				<Link href="" className='text-sm flex gap-2 items-center start-end'>
					View all listings
					<ArrowRight size={16}/>
				</Link>
			</div>
			<div className="listings gap-4 justify-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
				{
					recommendedListings.listings.map((item) => {
						return(
							<ListingCard listing={item} key={item.id} />
						);
					})
				}
			</div>
		</section>
	);
}
