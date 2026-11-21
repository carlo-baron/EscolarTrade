// Run with: node --import ./tests/register.mjs tests/randomize-seeded-like-counts.mjs
import nextEnv from "@next/env"

const { loadEnvConfig } = nextEnv
loadEnvConfig(process.cwd())
process.env.NEXT_PUBLIC_FIREBASE_MODE = "live"

const { adminDb } = await import("../lib/firebase-admin.ts")

const listingsRef = adminDb.collection("listings")
const snapshot = await listingsRef.get()
const seededListings = snapshot.docs.filter((doc) =>
  doc.data().images?.some((url) =>
    /^https:\/\/picsum\.photos\/seed\/escolartrade-\d+-\d+\/900\/600$/.test(url)
  )
)

if (seededListings.length === 0) {
  await adminDb.terminate()
  throw new Error("No listings with the seed script's Picsum URL pattern were found.")
}

const batch = adminDb.batch()
seededListings.forEach((doc, index) => {
  // A shuffled, distinct spread from 3 to 96, varied on each run.
  const count = 3 + ((index * 37 + Math.floor(Math.random() * 94)) % 94)
  batch.update(doc.ref, { likeCount: count })
})

await batch.commit()
console.log(`Updated likeCount on ${seededListings.length} seeded listings in escolar-trade.`)
await adminDb.terminate()
