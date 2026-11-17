"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ListingCard } from "@/components/Marketplace/ListingCard";
import { Search, LayoutGrid, List } from "lucide-react";
import { ListingDetailedType } from "@/schemas/listing.schema";

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
  const [items, setItems] = useState<ListingDetailedType[]>(INITIAL_LIKED_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recently-saved");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-950 dark:text-white pb-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Liked Items</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700">
              {items.length} items
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Items you've liked to revisit later.</p>
        </div>

        {/* Toolbar: Search & Sort / View Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-gray-50 dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 transition-colors">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-neutral-400" />
            <input
              type="text"
              placeholder="Search saved items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            >
              <option value="recently-saved">Recently Saved</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <div className="flex items-center border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-950 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-gray-100 dark:bg-neutral-800 text-black dark:text-white" : "text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-200"}`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-gray-100 dark:bg-neutral-800 text-black dark:text-white" : "text-gray-400 dark:text-neutral-400 hover:text-gray-600 dark:hover:text-neutral-200"}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="transition-transform duration-200 hover:-translate-y-1">
                <ListingCard listing={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-gray-300 dark:border-neutral-800 mt-6">
            <p className="text-gray-500 dark:text-neutral-400 font-medium">No matching saved items found.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-neutral-200 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}