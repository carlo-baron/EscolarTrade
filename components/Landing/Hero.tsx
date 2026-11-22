import Link from "next/link";
import { 
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "../ui/button";
import {
	ShieldCheck,
	ArrowRight,
	MailCheck,
	PhilippinePeso,
	Store,
	University,
	MapPin,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { getFeaturedListing } from "@/lib/marketplace/listings.service";
import { ListingType } from "@/schemas/listing.schema";

export async function Hero(){
	const featuredListing = await getFeaturedListing();

	return(
		<section id="hero"
			className="border pt-14 w-full gap-0 lg:gap-4 flex flex-col lg:flex-row hero h-fit min-h-screen">
			<Banner />
			<FeaturedListingCard listing={featuredListing}/>
		</section>
	);
}

async function FeaturedListingCard({ listing } : { listing: ListingType }){
	return(
		<div className="p-8 flex items-center justify-center h-full item-card lg:w-[40%]">
			<Link href="">
				<Card className='max-w-md'>
					<CardHeader>
						<div className='flex gap-2'>
							<Avatar>
								<AvatarImage src="" />
								<AvatarFallback>{listing.seller.displayName[0]}</AvatarFallback>
							</Avatar>
							<span>
								<CardTitle>{listing.seller.displayName}</CardTitle>
								<CardDescription className='text-xs'>{listing.seller.program}</CardDescription>
							</span>
						</div>
						<CardAction>
							<Badge>{listing.status}</Badge>
						</CardAction>
					</CardHeader>
					<Separator />
					<CardContent>
						<img 
							className='rounded-md object-cover w-full h-[300px]'
							src={listing.images[0]}
							alt={listing.title}
						/>
					</CardContent>
					<CardFooter className='flex-col'>
						<span className='flex w-full items-center'>
							<p className="text-md font-semibold">
								{listing.title}
							</p>
							<p className="ml-auto text-lg font-bold">
								₱{listing.priceCentavos / 100}
							</p>
						</span>
						<p className="text-xs">
							{listing.description}
						</p>
						<Card className='mt-4 px-4 py-2 w-full'>
							<p className="text-xs flex gap-2 items-center">
								<MapPin />
								{listing.meetupLocations[0]}
								<span className='text-muted-foreground ml-auto'>Cash</span>
							</p>
						</Card>
					</CardFooter>
				</Card>
			</Link>
		</div>
	);
}

const PHRASES = [
	{
		icon: MailCheck,
		text: "Verified @mls.ceu.edu.ph email"
	},
	{
		icon: PhilippinePeso,
		text: "Zero transaction fees"
	},
	{
		icon: Store,
		text: "Designated campus exchange"
	},
	{
		icon: University,
		text: "CEU Malolos community"
	}
]

function Banner(){
	return(
		<div className="banner pt-6 lg:pt-0 lg:w-[60%] flex flex-col justify-center px-8">
			<Badge variant="outline" className='rounded-sm flex flex-row gap-1 px-2 py-1 w-fit items-center'>
				<ShieldCheck size={16} />
				<p className='text-xs font-medium'>
					CEU Malolos Exclusive Marketplace
				</p>
			</Badge>
			<h1
				className='text-2xl lg:text-4xl font-bold mb-2'
			>Buy and Sell within CEU Malolos.</h1>
			<p className="text-sm text-muted-foreground mb-4">
				The trusted student marketplace for Centro Escolar University Malolos. Save money on textbooks, trade gadgets, sell pre-loved uniforms, and meet safely on campus with verified peers.
			</p>
			<div className="gap-2 cta flex flex-col mb-4 lg:flex-row">
				<Button size="lg">Get Started 
					<ArrowRight />
				</Button>
				<Button size="lg" variant="outline">Browse Marketplace</Button>
			</div>

			<Separator className="mb-4" />

			<div className="grid grid-cols-2 grid-rows-2 lg:flex lg:flex-wrap gap-x-6 phrase">
				{
					PHRASES.map((item, index) => {
						const Icon = item.icon;
						return(
							<div key={index} className='flex text-xs gap-1 items-center'>
								<Icon size={18} />
								<p className='truncate font-medium text-muted-foreground'>
									{item.text}
								</p>
							</div>
						);
					})
				}
			</div>
		</div>
	);
}
