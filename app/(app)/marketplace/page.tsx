import type { Metadata } from "next"

import Link from "next/link"
import { ArrowRight, CirclePlus } from "lucide-react"
import { MarketplaceBrowser } from "@/components/Marketplace/MarketplaceBrowser"
import { ListingCard } from "@/components/Marketplace/ListingCard"
import { MARKETPLACE_LISTINGS, RECOMMENDED_LISTINGS } from "@/data/sample-listings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
	title: "Marketplace | EscolarTrade",
	description:
	"Browse sample textbooks, uniforms, supplies, and more from the CEU Malolos campus community.",
}

export default function MarketplacePage() {
	return (
		<main>
			<MarketplaceBrowser listings={MARKETPLACE_LISTINGS} />
			<section
				className="bg-muted/60 py-8"
				aria-labelledby="recommendations-heading"
			>
				<div className="mx-auto max-w-7xl px-4 lg:px-8">
					<p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
						Personalized for you
					</p>
					<div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
						<div>
							<h2
								id="recommendations-heading"
								className="font-heading text-xl font-semibold"
							>
								Recommended for Nursing &amp; Health Sciences
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Sample essentials for CEU Nursing Escolarians.
							</p>
						</div>
						<Link
							href="#nursing-listings"
							className="flex items-center gap-2 text-xs font-medium hover:underline"
						>
							See all Nursing &amp; MedTech listings
							<ArrowRight className="size-4" />
						</Link>
					</div>
					<div
						id="nursing-listings"
						className="justify-items-center grid grid-cols-1 md:grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4"
					>
						{RECOMMENDED_LISTINGS.map((listing) => (
							<ListingCard
								key={listing.id}
								listing={listing}
							/>
						))}
					</div>
				</div>
			</section>
			<section
				className="mx-auto max-w-7xl px-4 py-8 lg:px-8"
				aria-labelledby="seller-heading"
			>
				<div className="flex flex-col gap-6 rounded-xl bg-foreground p-6 text-background lg:flex-row lg:items-center lg:justify-between lg:p-8">
					<div className="max-w-xl">
						<Badge variant="secondary">Campus peer commerce</Badge>
						<h2
							id="seller-heading"
							className="mt-3 font-heading text-2xl font-semibold"
						>
							Have course materials from last sem?
						</h2>
						<p className="mt-2 text-sm leading-relaxed opacity-80">
							Turn unused lab gowns, dental mannequins, engineering
							calculators, or textbooks into cash. It takes 2 minutes to post.
						</p>
					</div>
					<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
						<Button variant="secondary" size="lg">
							<CirclePlus />
							List an Item Now
						</Button>
						<Button
							variant="link"
							className="text-background"
						>
							Seller Guide &amp; Meetup Rules
						</Button>
					</div>
				</div>
			</section>
		</main>
	)
}
