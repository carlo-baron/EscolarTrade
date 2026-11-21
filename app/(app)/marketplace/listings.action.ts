"use server"

import {
  getListings,
  type MarketplaceListingFilter,
} from "@/lib/marketplace/listings.service"

export async function loadMoreListings(
  filter: MarketplaceListingFilter,
  cursor: string
) {
  return getListings(filter, cursor)
}
