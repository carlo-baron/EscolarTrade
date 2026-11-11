"use client"

import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ItemGroup } from "@/components/ui/item"
import { ListingCard } from "./ListingCard"
import { ListingItem } from "./ListingItem"
import { conditions, locations } from "@/types/market.types"
import { ListingType } from "@/schemas/listing.schema"

type MarketplaceBrowserProps = {
  listings: ListingType[]
}

export function MarketplaceBrowser({
  listings,
}: MarketplaceBrowserProps) {
  const [layout, setLayout] = useState<"grid" | "list">("grid")

  return (
    <section
      aria-label="Marketplace listings"
      className="mx-auto max-w-7xl px-4 py-6 lg:px-8"
    >
      <form
        action="/marketplace"
        method="GET"
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
            id="campus-zone"
            name="zone"
            className="w-full"
          >
            <NativeSelectOption value="">
              All Drop-off Locations
            </NativeSelectOption>

            {locations.map((location) => (
              <NativeSelectOption
                key={location}
                value={location}
              >
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
            id="condition"
            name="condition"
            className="w-full"
          >
            <NativeSelectOption value="">
              Any Condition
            </NativeSelectOption>

            {conditions.map((item) => (
              <NativeSelectOption
                key={item}
                value={item}
              >
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
              id="minimum-price"
              name="min"
              aria-label="Minimum price in pesos"
              type="number"
              min="0"
              placeholder="₱0"
            />

            <span className="text-muted-foreground">–</span>

            <Input
              name="max"
              aria-label="Maximum price in pesos"
              type="number"
              min="0"
              placeholder="₱3,000"
            />
          </div>
        </Field>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Apply Filters
          </Button>

          <Button type="reset" variant="ghost">
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

          <NativeSelect
            id="listing-sort"
            name="sort"
            defaultValue="recent"
          >
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
              variant={layout === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Grid view"
              aria-pressed={layout === "grid"}
              onClick={() => setLayout("grid")}
            >
              <LayoutGrid />
            </Button>

            <Button
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

      {layout === "grid" ? (
        <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
            />
          ))}
        </div>
      ) : (
        <ItemGroup>
          {listings.map((listing) => (
            <ListingItem
              key={listing.id}
              listing={listing}
            />
          ))}
        </ItemGroup>
      )}

      {listings.length === 0 && (
        <p
          className="py-16 text-center text-sm text-muted-foreground"
          role="status"
        >
          No listings match your search and filters.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-10 pb-2">
        <p
          className="text-xs text-muted-foreground"
          aria-live="polite"
        >
          Showing {listings.length ? "1–" : ""}
          {listings.length} of {listings.length} listings
        </p>

        <Pagination
          aria-label="Listing pages"
          className="mx-0 w-auto"
        >
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                tabIndex={-1}
                className="pointer-events-none opacity-50"
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink isActive>
                1
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                tabIndex={-1}
                className="pointer-events-none opacity-50"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  )
}
