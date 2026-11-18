"use client"

import { useEffect, useState } from "react"
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
import { useGetLikedListings } from "@/hooks/marketplace/likes.hook"


// TODO for listing card and listing item, have an event to tell if the liked button happened (only for optimistic rendering)
export default function LikesPage() {
	const [searchQuery, setSearchQuery] = useState("")
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
	const [items, setItems] = useState<ListingDetailedType[]>([]);
	const likedListings = useGetLikedListings();

	useEffect(() => {
		async function getLiked(){
			const likedListingsData = await likedListings();
			setItems(likedListingsData);
		}

		getLiked();
	}, [likedListings]);

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
