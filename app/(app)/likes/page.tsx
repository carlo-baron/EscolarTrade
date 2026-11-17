"use client"

import { useState } from "react"
import { Search, LayoutGrid, List } from "lucide-react"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group"
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"
import { ListingCard } from "@/components/Marketplace/ListingCard"
import { ListingItem } from "@/components/Marketplace/ListingItem"
import { Button } from "@/components/ui/button"
import { ItemGroup } from "@/components/ui/item"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty"
import type { ListingDetailedType } from "@/schemas/listing.schema"

const INITIAL_LIKED_ITEMS: ListingDetailedType[] = [
	{
		id: "1",
		slug: "brunner-suddarths-textbook-of-medical-surgical-nursing-14th-ed",
		title: "Brunner & Suddarth's Textbook of Medical-Surgical Nursing (14th Ed)",
		description: "14th Ed Hardbound textbook in great condition, minimal highlights.",
		priceCentavos: 185000,
		initialPriceCentavos: 200000,
		previousPriceCentavos: null,
		priceChangedAt: null,
		images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80"],
		category: "Textbooks & Reviewers",
		condition: "Used - Good",
		isLiked: true,
		seller: {
			id: "user-1",
			displayName: "Sofia L.",
			avatar: "SL",
			program: "BS Nursing 4th Yr",
		},
		meetupLocations: ["Centennial Bldg"],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	} as unknown as ListingDetailedType,
	{
		id: "2",
		slug: "casio-fx-991cw-classwiz-scientific-calculator",
		title: "Casio fx-991CW ClassWiz Scientific Calculator",
		description: "Includes slide cover and original hard case.",
		priceCentavos: 115000,
		initialPriceCentavos: 125000,
		previousPriceCentavos: null,
		priceChangedAt: null,
		images: ["https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=800&q=80"],
		category: "Scientific Calculators",
		condition: "Used - Like New",
		isLiked: true,
		seller: {
			id: "user-2",
			displayName: "Angelo D.",
			avatar: "AD",
			program: "BS Pharmacy 2nd Yr",
		},
		meetupLocations: ["Canteen"],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	} as unknown as ListingDetailedType,
	{
		id: "3",
		slug: "littmann-classic-iii-stethoscope",
		title: "Littmann Classic III Stethoscope",
		description: "Special Black Edition stethoscope. Pristine condition.",
		priceCentavos: 420000,
		initialPriceCentavos: 450000,
		previousPriceCentavos: null,
		priceChangedAt: null,
		images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"],
		category: "Gadgets & Tech",
		condition: "Used - Excellent",
		isLiked: true,
		seller: {
			id: "user-3",
			displayName: "Marielle R.",
			avatar: "MR",
			program: "BS MedTech 3rd Yr",
		},
		meetupLocations: ["Science Hall"],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	} as unknown as ListingDetailedType,
	{
		id: "4",
		slug: "ceu-clinical-duty-uniform-set",
		title: "CEU Clinical Duty Uniform Set",
		description: "Size Medium, brand new in plastic with CEU patch.",
		priceCentavos: 55000,
		initialPriceCentavos: 55000,
		previousPriceCentavos: null,
		priceChangedAt: null,
		images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80"],
		category: "Uniforms",
		condition: "Brand New",
		isLiked: true,
		seller: {
			id: "user-4",
			displayName: "Camille M.",
			avatar: "CM",
			program: "BS Tourism 3rd Yr",
		},
		meetupLocations: ["Gate 1"],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	} as unknown as ListingDetailedType,
	{
		id: "5",
		slug: "pnle-board-exam-comprehensive-reviewer",
		title: "PNLE Board Exam Comprehensive Reviewer",
		description: "Complete set with notes and high-yield summaries.",
		priceCentavos: 65000,
		initialPriceCentavos: 80000,
		previousPriceCentavos: null,
		priceChangedAt: null,
		images: ["https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"],
		category: "Textbooks & Reviewers",
		condition: "Used - Good",
		isLiked: true,
		seller: {
			id: "user-5",
			displayName: "Mark D.",
			avatar: "MD",
			program: "BS Nursing 3rd Yr",
		},
		meetupLocations: ["Student Ctr"],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	} as unknown as ListingDetailedType,
];

export default function LikesPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

	const items = INITIAL_LIKED_ITEMS
	const normalizedSearch = searchQuery.trim().toLowerCase()

	const filteredItems = items.filter(
		(item) =>
			item.title.toLowerCase().includes(normalizedSearch) ||
				item.category.toLowerCase().includes(normalizedSearch)
	)

	return (
		<main className="mx-auto max-w-7xl px-4 py-8 pb-16 lg:px-8">
			<div className="flex mb-6 justify-between flex-col sm:flex-row">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-semibold">Liked Items</h1>
						<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
							{items.length} items
						</span>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">
						Items you’ve liked to revisit later.
					</p>
				</div>

				<div className="flex w-full flex-row items-center justify-end gap-2 pt-4 sm:w-auto sm:pt-0">
					<InputGroup className="min-w-0 flex-1">
						<InputGroupInput
							type="search"
							placeholder="Search liked items..."
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							aria-label="Search liked items"
						/>
						<InputGroupAddon>
							<Search />
						</InputGroupAddon>
					</InputGroup>

					<Tabs
						value={viewMode}
						onValueChange={(value) => setViewMode(value as "grid" | "list")}
						className="shrink-0"
					>
						<TabsList>
							<TabsTrigger value="grid" aria-label="Grid view">
								<LayoutGrid />
							</TabsTrigger>
							<TabsTrigger value="list" aria-label="List view">
								<List />
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{filteredItems.length === 0 ? (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Search />
						</EmptyMedia>
						<EmptyTitle>No matching liked items</EmptyTitle>
						<EmptyDescription>
							Try another search, or clear it to see all your liked items.
						</EmptyDescription>
					</EmptyHeader>
					{searchQuery && (
						<EmptyContent>
							<Button
								type="button"
								variant="outline"
								onClick={() => setSearchQuery("")}
							>
								Clear search
							</Button>
						</EmptyContent>
					)}
				</Empty>
			) : viewMode === "grid" ? (
					<div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{filteredItems.map((item) => (
							<ListingCard key={item.id} listing={item} />
						))}
					</div>
				) : (
						<ItemGroup>
							{filteredItems.map((item) => (
								<ListingItem key={item.id} listing={item} />
							))}
						</ItemGroup>
					)}
		</main>
	)
}
