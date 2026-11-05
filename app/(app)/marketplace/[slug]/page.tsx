import { Breadcrumbs } from "@/components/Marketplace/Breadcrumbs";
import { ListingImages } from "@/components/Marketplace/ListingDetails/ListingImages";
import { ListingDetailCard } from "@/components/Marketplace/ListingDetails/ListingDetailCard";
import { SimilarItemByCategory } from "@/components/Marketplace/ListingDetails/SimilarItemByCategory";

interface ListingDetailProps{
	params: Promise<{ slug: string }>
}

import type { Listing } from "@/types/market.types"

const listItem: Listing = {
	id: "principles-anatomy-physiology",
	title: "Principles of Anatomy and Physiology",
	category: "Textbooks & Reviewers",
	price: 1250,
	status: "Available",
	condition: "Used - Like New",
	description:
	"Used for 1 term in CEU Malolos College of Nursing. Clean hardcover with minimal shelf wear. Light neat pencil annotations in Unit 2 (Muscular System) only. Free reference chart and histology disc included.",
	image: [
		"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1000&q=80",
		"https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80",
	],
	seller: {
		name: "Bea R.",
		program: "BS Nursing - 3rd Year",
	},
	location: ["Library", "Gate 1", "Gate 4"],
}

const crumbs = {
	links: [
		{
			label: "Marketplace",
			link: "/marketplace"
		},
		{
			label: "Textbooks & Reviewers",
			link: `/marketplace?category=${encodeURIComponent("Textbooks & Reviewers")}`
		}
	],
	page: "Principles of Anatomy and Physiology"
};

export default async function ListingDetailsPage({ params } : ListingDetailProps){
	const { slug } = await params;

	return(
		<main className="p-8 pt-4">
			<Breadcrumbs breadcrumbs={crumbs}/>
			<section className="mb-8 mt-4 product-details lg:flex-row flex flex-col gap-4">
				<ListingImages 
					listing={listItem}
				/>
				<ListingDetailCard listing={listItem} />
			</section>
			<SimilarItemByCategory category={listItem.category}/>
		</main>
	);
}
