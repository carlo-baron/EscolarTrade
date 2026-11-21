"use client"

import Link from "next/link"
import { useState, type SubmitEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LayoutGrid, List, ShoppingBasket, Plus } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Field, FieldLabel } from "@/components/ui/field"
import { ItemGroup } from "@/components/ui/item"
import { loadMoreListings } from "@/app/(app)/marketplace/listings.action"
import { ListingCard } from "./ListingCard"
import { ListingItem } from "./ListingItem"
import { conditions, locations } from "@/types/market.types"
import type { ListingDetailedType } from "@/schemas/listing.schema"
import type { MarketplaceListingFilter } from "@/lib/marketplace/listings.service"

type MarketplaceBrowserProps = {
  listings: ListingDetailedType[]
  nextCursor: string | null
  filters: MarketplaceListingFilter
}

export function MarketplaceBrowser({
  listings,
  nextCursor: initialCursor,
  filters,
}: MarketplaceBrowserProps) {
  const [allListings, setAllListings] = useState(listings)
  const [cursor, setCursor] = useState(initialCursor)
  const [loadingMore, setLoadingMore] = useState(false)
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const router = useRouter()
  const searchParams = useSearchParams()

  const zone = searchParams.get("zone") ?? ""
  const condition = searchParams.get("condition") ?? ""
  const min = searchParams.get("min") ?? ""
  const max = searchParams.get("max") ?? ""

  async function handleLoadMore() {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const result = await loadMoreListings(filters, cursor)
      setAllListings((current) => [...current, ...result.listings])
      setCursor(result.nextCursor)
    } finally {
      setLoadingMore(false)
    }
  }

  function createMarketplaceUrl(
    updates: Record<string, string | null>
  ) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      const normalizedValue = value?.trim()

      if (normalizedValue) {
        params.set(key, normalizedValue)
      } else {
        params.delete(key)
      }
    })

    params.delete("page")

    const query = params.toString()
    return query ? `/marketplace?${query}` : "/marketplace"
  }

  function handleApplyFilters(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    router.push(
      createMarketplaceUrl({
        zone: formData.get("zone")?.toString() || null,
        condition: formData.get("condition")?.toString() || null,
        min: formData.get("min")?.toString() || null,
        max: formData.get("max")?.toString() || null,
      }),
      { scroll: false }
    )
  }

  function handleClearFilters() {
    router.push(
      createMarketplaceUrl({
        zone: null,
        condition: null,
        min: null,
        max: null,
      }),
      { scroll: false }
    )
  }

  return (
    <section
      aria-label="Marketplace listings"
      className="mx-auto max-w-7xl px-4 py-6 lg:px-8"
    >
      <form
        onSubmit={handleApplyFilters}
        className="grid gap-4 rounded-xl bg-muted p-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end lg:p-5"
      >
        <Field>
          <FieldLabel
            htmlFor="campus-zone"
            className="text-xs text-muted-foreground uppercase"
          >
            Campus Zone
          </FieldLabel>

          <NativeSelect
            key={`zone-${zone}`}
            id="campus-zone"
            name="zone"
            defaultValue={zone}
            className="w-full"
          >
            <NativeSelectOption value="">
              All Drop-off Locations
            </NativeSelectOption>

            {locations.map((location) => (
              <NativeSelectOption key={location} value={location}>
                {location}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="condition"
            className="text-xs text-muted-foreground uppercase"
          >
            Condition
          </FieldLabel>

          <NativeSelect
            key={`condition-${condition}`}
            id="condition"
            name="condition"
            defaultValue={condition}
            className="w-full"
          >
            <NativeSelectOption value="">
              Any Condition
            </NativeSelectOption>

            {conditions.map((item) => (
              <NativeSelectOption key={item} value={item}>
                {item}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel
            htmlFor="minimum-price"
            className="text-xs text-muted-foreground uppercase"
          >
            Price Range (PHP)
          </FieldLabel>

          <div className="flex items-center gap-2">
            <Input
              key={`min-${min}`}
              id="minimum-price"
              name="min"
              aria-label="Minimum price in pesos"
              type="number"
              min="0"
              placeholder="₱0"
              defaultValue={min}
            />

            <span className="text-muted-foreground">–</span>

            <Input
              key={`max-${max}`}
              name="max"
              aria-label="Maximum price in pesos"
              type="number"
              min="0"
              placeholder="₱3,000"
              defaultValue={max}
            />
          </div>
        </Field>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Apply Filters
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-4 py-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="font-heading text-2xl font-semibold">
            Campus Listings
          </h1>

          <span className="text-xs text-muted-foreground">
            Sample campus listings
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="listing-sort"
            className="text-xs text-muted-foreground"
          >
            Sort:
          </label>

          <NativeSelect id="listing-sort" name="sort" defaultValue="recent">
            <NativeSelectOption value="recent">
              Most Recent
            </NativeSelectOption>
            <NativeSelectOption value="low">
              Price: Low to High
            </NativeSelectOption>
            <NativeSelectOption value="high">
              Price: High to Low
            </NativeSelectOption>
          </NativeSelect>

          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <Button
              type="button"
              variant={layout === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Grid view"
              aria-pressed={layout === "grid"}
              onClick={() => setLayout("grid")}
            >
              <LayoutGrid />
            </Button>

            <Button
              type="button"
              variant={layout === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="List view"
              aria-pressed={layout === "list"}
              onClick={() => setLayout("list")}
            >
              <List />
            </Button>
          </div>
        </div>
      </div>

      {allListings.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingBasket />
            </EmptyMedia>
            <EmptyTitle>No Listings Found.</EmptyTitle>
            <EmptyDescription>
              No listings match your search and filters.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/my-listing/new">
              <Button><Plus /> Post a Listing</Button>
            </Link>
          </EmptyContent>
        </Empty>
      ) : layout === "grid" ? (
        <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <ItemGroup>
          {allListings.map((listing) => (
            <ListingItem key={listing.id} listing={listing} />
          ))}
        </ItemGroup>
      )}

      {cursor && (
        <div className="flex justify-center pt-10 pb-2">
          <Button type="button" variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </section>
  )
}
