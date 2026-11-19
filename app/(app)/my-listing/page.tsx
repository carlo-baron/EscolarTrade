"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { MapPin, MessageSquare, Pencil, Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ListingType } from "@/schemas/listing.schema"
import { useGetMyListings } from "@/hooks/marketplace/mylistings.hook"
import { listingStatuses } from "@/types/market.types"
import { updateListingStatus } from "./listing-status.server"
import { deleteSoldListing } from "./listing-delete.server"

type ListingStatus = ListingType["status"]
type StatusFilter = "All" | ListingStatus

const statusFilters: StatusFilter[] = [
	"All",
	"Available",
	"Pending",
	"Sold",
	"Out of Stock",
]

function formatPrice(priceCentavos: number) {
	return `₱${(priceCentavos / 100).toLocaleString("en-PH", {
minimumFractionDigits: 0,
maximumFractionDigits: 2,
})}`
}

export default function MyListingsPage() {
	const [listings, setListings] = useState<ListingType[]>([]);
	const [activeTab, setActiveTab] = useState<StatusFilter>("All")
	const [search, setSearch] = useState("")
	const [sort, setSort] = useState("newest")
	const [listingToMarkSold, setListingToMarkSold] =
	useState<ListingType | null>(null)
	const [listingToDelete, setListingToDelete] = useState<ListingType | null>(null)
	const [updatingListingIds, setUpdatingListingIds] = useState<string[]>([])
	const [isDeletingListing, setIsDeletingListing] = useState(false)

	const getMyListings = useGetMyListings();

	useEffect(() => {
		async function getListings(){
			const myListings = await getMyListings();
			setListings(myListings);
		}

		getListings();
	}, [getMyListings]);

	const filteredListings = useMemo(() => {
		const normalizedSearch = search.trim().toLowerCase()

		return listings
			.filter((listing) => {
				const matchesStatus =
					activeTab === "All" || listing.status === activeTab

				const matchesSearch =
					listing.title.toLowerCase().includes(normalizedSearch) ||
						listing.category.toLowerCase().includes(normalizedSearch)

				return matchesStatus && matchesSearch
			})
			.sort((a, b) => {
				switch (sort) {
					case "oldest":
						return a.createdAt.toString().localeCompare(b.createdAt.toString())
					case "price-low":
						return a.priceCentavos - b.priceCentavos
					case "price-high":
						return b.priceCentavos - a.priceCentavos
					default:
						return b.createdAt.toString().localeCompare(a.createdAt.toString())
				}
			})
	}, [listings, activeTab, search, sort])

	async function persistStatusChange(id: string, status: ListingStatus) {
		setUpdatingListingIds((current) => [...current, id])

		try {
			const result = await updateListingStatus(id, status)

			if (!result.success) {
				toast.error("Status was not updated", {
					description: result.error,
				})
				return false
			}

			setListings((current) =>
				current.map((listing) =>
					listing.id === id
						? {
							...listing,
							status,
							...(status === "Sold" && { soldAt: new Date() }),
						}
						: listing
				)
			)
			toast.success("Status updated", {
				description: `Listing marked as ${status}.`,
			})

			return true
		} catch {
			toast.error("Status was not updated", {
				description: "Please try again.",
			})
			return false
		} finally {
			setUpdatingListingIds((current) =>
				current.filter((listingId) => listingId !== id)
			)
		}
	}

	function requestStatusChange(listing: ListingType, status: ListingStatus) {
		if (updatingListingIds.includes(listing.id)) return

		if (status === "Sold") {
			setListingToMarkSold(listing)
			return
		}

		void persistStatusChange(listing.id, status)
	}

	async function confirmSold() {
		if (!listingToMarkSold) return

		await persistStatusChange(listingToMarkSold.id, "Sold")
		setListingToMarkSold(null)
	}

	async function confirmDeleteListing() {
		if (!listingToDelete || isDeletingListing) return

		setIsDeletingListing(true)

		try {
			const result = await deleteSoldListing(listingToDelete.id)

			if (!result.success) {
				toast.error("Listing was not deleted", {
					description: result.error,
				})
				return
			}

			setListings((current) =>
				current.filter((listing) => listing.id !== listingToDelete.id)
			)
			setListingToDelete(null)
			toast.success("Listing deleted")
		} catch {
			toast.error("Listing was not deleted", {
				description: "Please try again.",
			})
		} finally {
			setIsDeletingListing(false)
		}
	}

	return (
		<main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
			<div className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-semibold sm:text-[26px]">
						My Listings
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage the items you’re selling.
					</p>
				</div>

				<Link href="/my-listing/new">
					<Button className="w-full gap-2 sm:w-auto">
						<Plus />
						Post a Listing
					</Button>
				</Link>
			</div>

			<div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
				<div className="min-w-0 flex-1">
					<Tabs
						value={activeTab}
						onValueChange={(value) => setActiveTab(value as StatusFilter)}
					>
						<TabsList className="flex h-auto w-full max-w-full flex-wrap justify-start lg:w-fit">
							{statusFilters.map((status) => (
								<TabsTrigger
									key={status}
									value={status}
									className="shrink-0 whitespace-nowrap"
								>
									{status}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
				</div>
				<div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
					<InputGroup className="min-w-0 flex-1 lg:w-[225px]">
						<InputGroupInput
							placeholder="Search your listings..."
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							aria-label="Search your listings"
						/>
						<InputGroupAddon>
							<Search />
						</InputGroupAddon>
					</InputGroup>

					<Select
						value={sort}
						onValueChange={(value) => setSort(value ?? "newest")}
					>
						<SelectTrigger className="w-full sm:w-[170px]">
							<SelectValue placeholder="Sort listings" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">Newest First</SelectItem>
							<SelectItem value="oldest">Oldest First</SelectItem>
							<SelectItem value="price-low">Price: Low to High</SelectItem>
							<SelectItem value="price-high">Price: High to Low</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<p className="mb-3 mt-5 text-sm text-muted-foreground">
				Showing {filteredListings.length} listings
			</p>

			{filteredListings.length > 0 ? (
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
					{filteredListings.map((listing) => {
						const isUpdatingStatus = updatingListingIds.includes(listing.id)

						return (
							<Card
								key={listing.id}
								className="flex h-full min-w-0 flex-col overflow-hidden py-0 shadow-none"
							>
								<div className="relative">
									<img
										src={listing.images[0]}
										alt={listing.title}
										className="block aspect-video w-full object-cover"
									/>

									<Badge
										variant="secondary"
										className="absolute bottom-2 left-2 z-10"
									>
										{listing.condition}
									</Badge>

									<Badge
										variant="outline"
										className="absolute left-2 top-2 z-10 bg-background/90"
									>
										{listing.status}
									</Badge>
								</div>

								<CardHeader className="gap-2 p-4">
									<div className="flex items-start justify-between gap-3">
										<p className="text-xs text-muted-foreground">
											{listing.category}
										</p>
										<p className="shrink-0 font-semibold">
											{formatPrice(listing.priceCentavos)}
										</p>
									</div>

									<CardTitle className="line-clamp-1 text-base">
										<Link href={`/marketplace/${listing.slug}`}>
											{listing.title}
										</Link>
									</CardTitle>

									<p className="truncate text-sm text-muted-foreground">
										{listing.description}
									</p>
								</CardHeader>

								<CardContent className="flex-1 px-4">
									<div className="flex min-w-0 items-start gap-2 border-t pt-3">
										<Avatar className="size-7 shrink-0">
											<AvatarFallback>{listing.seller.displayName[0]}</AvatarFallback>
										</Avatar>

										<div className="min-w-0">
											<p className="truncate text-sm">
												<span className="font-medium">
													{listing.seller.displayName}
												</span>
												<span className="text-muted-foreground">
													{" "}· {listing.seller.program}
												</span>
											</p>
										</div>
									</div>

									<p className="mt-2 flex items-start gap-1 text-sm text-muted-foreground">
										<MapPin className="mt-0.5 size-4 shrink-0" />
										<span className="truncate">
											{listing.meetupLocations.join(", ")}
										</span>
									</p>
								</CardContent>

								<CardFooter className="flex-col items-stretch gap-3 border-t bg-muted/40 p-3">
									{listing.status === "Sold" ? (
										<div className="grid grid-cols-1 grid-rows-2 gap-2 ">
											<Link href={`/messages/${listing.id}`}>
												<Button variant="outline"
													className="w-full"
												>
													<MessageSquare />
													Messages
												</Button>
											</Link>
											<Button
												variant="destructive"
												onClick={() => setListingToDelete(listing)}
											>
												Delete Listing
											</Button>
										</div>
									) : (
											<div className="grid grid-cols-2 gap-2">
												<Link href={`/my-listing/${listing.id}`}>
													<Button variant="outline" className="w-full">
														<Pencil />
														Edit
													</Button>
												</Link>

												<Select
													value={null}
													disabled={isUpdatingStatus}
													onValueChange={(value) => {
														if (
															!value ||
																!listingStatuses.includes(value as ListingStatus)
														)
															return

														requestStatusChange(listing, value as ListingStatus)
													}}
												>
													<SelectTrigger className="w-full">
														<SelectValue
															placeholder={isUpdatingStatus ? "Updating..." : "Change"}
														/>
													</SelectTrigger>
													<SelectContent>
														{listing.status !== "Available" && (
															<SelectItem value="Available">
																Set Available
															</SelectItem>
														)}

														{listing.status !== "Pending" && (
															<SelectItem value="Pending">
																Set Pending
															</SelectItem>
														)}

														{listing.status !== "Out of Stock" && (
															<SelectItem value="Out of Stock">
																Set Out of Stock
															</SelectItem>
														)}

														<SelectItem value="Sold">Mark as Sold</SelectItem>
													</SelectContent>
												</Select>
												<Link href="/messages" className="col-span-2">
													<Button variant="outline" className="w-full">
														<MessageSquare />
														Messages
													</Button>
												</Link>
											</div>
										)}
								</CardFooter>
							</Card>
						)
					})}
				</div>
			) : (
					<Empty className="mt-8">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Search />
							</EmptyMedia>
							<EmptyTitle>No listings found</EmptyTitle>
							<EmptyDescription>
								Try changing your search or selected status.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent className="flex justify-center flex-row gap-2">
							<Link href="/my-listing/new">
								<Button
									type="button"
								>
									<Plus />
									Create Listing
								</Button>
							</Link>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									setSearch("")
									setActiveTab("All")
								}}
							>
								Clear filters
							</Button>
						</EmptyContent>
					</Empty>
				)}

			<AlertDialog
				open={listingToMarkSold !== null}
				onOpenChange={(open) => {
					if (!open) setListingToMarkSold(null)
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Mark this listing as sold?</AlertDialogTitle>
						<AlertDialogDescription>
							{listingToMarkSold && (
								<>
									Marking “{listingToMarkSold.title}” as sold is final. It will
									no longer appear in Marketplace browsing, and this action
									cannot be undone.
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmSold}>
							Confirm Sold
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={listingToDelete !== null}
				onOpenChange={(open) => {
					if (!open && !isDeletingListing) setListingToDelete(null)
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this sold listing?</AlertDialogTitle>
						<AlertDialogDescription>
							{listingToDelete && (
								<>
									This permanently removes “{listingToDelete.title}” from
									your listings. This cannot be undone.
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeletingListing}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeletingListing}
							onClick={confirmDeleteListing}
						>
							{isDeletingListing ? "Deleting..." : "Delete listing"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</main>
	)
}
