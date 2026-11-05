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

export function Hero(){
	return(
		<section id="hero"
			className="border pt-14 w-full gap-0 lg:gap-4 flex flex-col lg:flex-row hero h-fit min-h-screen">
			<Banner />
			<FeaturedListingCard />
		</section>
	);
}

function FeaturedListingCard(){
	// TODO: Link to actual listing
	
	return(
		<div className="p-8 flex items-center justify-center h-full item-card lg:w-[40%]">
			<Link href="">
				<Card className='max-w-md'>
					<CardHeader>
						<div className='flex gap-2'>
							<Avatar>
								<AvatarImage src="" />
								<AvatarFallback>CN</AvatarFallback>
							</Avatar>
							<span>
								<CardTitle>Villanueva, Nicho</CardTitle>
								<CardDescription className='text-xs'>BSIT - 3rd Year</CardDescription>
							</span>
						</div>
						<CardAction>
							<Badge>Active Listing</Badge>
						</CardAction>
					</CardHeader>
					<Separator />
					<CardContent>
						<img 
							className='rounded-md object-cover w-full h-[300px]'
							src='https://lh3.googleusercontent.com/aida-public/AB6AXuDo_sF4xBq10AxbjZovJ99cxhfEgiiUds7-tKAvHcSiRIu4DI0naxhiOn0qc66uzSgaW9JjmGi3bt3etqtMdJU30B3inZ5J4wi0N-mvRUyh-ZFevaeN-QdG56-BH_AndGgst2tKlCwbDNx7gBaV_LwvEQ0Rhi33iETI5EtIhoEyyBEW5o8kMf5b8dsGGSnTOax9rLDoOJWOdiXcUhBRp7TjaSfpofcz-f8BXMVnxFFoc-W5VrVquaWD' 
							alt="Lab Item"
						/>
					</CardContent>
					<CardFooter className='flex-col'>
						<span className='flex w-full items-center'>
							<p className="text-md font-semibold">
								3M Litmann Classic III + Lab Gown
							</p>
							<p className="ml-auto text-lg font-bold">
								₱4,200
							</p>
						</span>
						<p className="text-xs">
							Used for 1 clinical rotation only. Complete with original spare earpieces and box.
						</p>
						<Card className='mt-4 px-4 py-2 w-full'>
							<p className="text-xs flex gap-2 items-center">
								<MapPin />
								Centrodome Lobby
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
