// Run with: node --import ./tests/register.mjs tests/seed-listings.mjs
// Requires the same Firebase Admin credentials/configuration as the app.
import { FieldValue } from "firebase-admin/firestore"
import nextEnv from "@next/env"
import slugify from "slugify"

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const { adminDb } = await import("../lib/firebase-admin.ts")

const TARGET_LISTING_COUNT = 50

const listingTemplates = [
  ["Gray Anatomy and Physiology Reviewer", "Textbooks & Reviewers", 450, "Used - Excellent", ["Library", "PHL Lobby"]],
  ["Biochemistry Lecture Notes Bundle", "Textbooks & Reviewers", 180, "Used - Good", ["Library", "CEU Square"]],
  ["Casio fx-991EX Scientific Calculator", "Scientific Calculators", 900, "Used - Like New", ["Gate 1", "Canteen"]],
  ["CEU Laboratory Gown", "Uniforms", 320, "Used - Good", ["Gate 3", "Gate 4"]],
  ["Green Nursing Scrub Suit", "Uniforms", 650, "Used - Excellent", ["PHL Lobby", "Library"]],
  ["A4 Index Cards and Highlighters", "Supplies & Stationery", 120, "Brand New", ["Canteen", "CEU Square"]],
  ["Bluetooth Wireless Mouse", "Gadgets & Tech", 380, "Used - Like New", ["Gate 1", "Library"]],
  ["USB-C Flash Drive 64GB", "Gadgets & Tech", 290, "Brand New", ["Gate 4", "PHL Lobby"]],
  ["Architecture Drawing Kit", "Project Materials", 550, "Used - Excellent", ["CEU Square", "Gate 3"]],
  ["Colored Paper and Illustration Board Set", "Project Materials", 160, "Brand New", ["Canteen", "Gate 1"]],
  ["Homemade Chocolate Chip Cookies", "Foods", 150, "Brand New", ["Canteen"]],
  ["Iced Coffee Concentrate Bottles", "Foods", 110, "Brand New", ["PHL Lobby", "Canteen"]],
]

function searchTokens(title) {
  const words = title.toLowerCase().match(/[a-z0-9]+/g) ?? []
  return [...new Set(words.map((word) => word.slice(0, 30)))].slice(0, 20)
}

function buildListing(index, sellerId, seller) {
  const [baseTitle, category, pricePesos, condition, meetupLocations] =
    listingTemplates[index % listingTemplates.length]
  const sequence = index + 1
  const title = `${baseTitle} #${sequence}`
  const slug = `${slugify(title, { lower: true, strict: true })}-${sequence}`
  const timestamp = FieldValue.serverTimestamp()

  return {
    images: [1, 2, 3].map(
      (photo) => `https://picsum.photos/seed/escolartrade-${sequence}-${photo}/900/600`
    ),
    title,
    description: `Pre-owned campus item in ${condition.toLowerCase()} condition. Available for meetup at the listed CEU Malolos locations.`,
    priceCentavos: pricePesos * 100,
    category,
    condition,
    meetupLocations,
    sellerId,
    seller,
    slug,
    searchTokens: searchTokens(title),
    status: "Available",
    initialPriceCentavos: pricePesos * 100,
    previousPriceCentavos: null,
    priceChangedAt: null,
    soldAt: null,
    likeCount: 0,
    moderationStatus: "visible",
    moderationVersion: 0,
    moderationReason: "",
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt: timestamp,
  }
}

const listings = adminDb.collection("listings")
const [countSnapshot, sourceSnapshot] = await Promise.all([
  listings.count().get(),
  listings.limit(1).get(),
])
const existingCount = countSnapshot.data().count

if (existingCount >= TARGET_LISTING_COUNT) {
  console.log(`No listings added: ${existingCount} already exist (target: ${TARGET_LISTING_COUNT}).`)
  process.exit(0)
}

const sourceListing = sourceSnapshot.docs[0]?.data()
if (!sourceListing?.sellerId || !sourceListing.seller) {
  throw new Error(
    "A current listing with sellerId and seller metadata is required to seed additional listings."
  )
}

const listingsToCreate = TARGET_LISTING_COUNT - existingCount
const batch = adminDb.batch()

for (let index = 0; index < listingsToCreate; index++) {
  const ref = listings.doc()
  batch.set(ref, buildListing(existingCount + index, sourceListing.sellerId, sourceListing.seller))
}

await batch.commit()
console.log(`Added ${listingsToCreate} listings. Total listings: ${TARGET_LISTING_COUNT}.`)
await adminDb.terminate()
