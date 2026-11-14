export const listingStatuses = [
	"Available",
	"Pending",
	"Sold",
	"Out of Stock"
] as const;

export const listingStatusColor: Record<ListingStatus, string> = {
	"Available": "bg-green-500",
	"Pending": "bg-yellow-500",
	"Sold": "bg-red-500",
	"Out of Stock": "bg-orange-500"
};

export type ListingStatus = (typeof listingStatuses)[number];

export const categories = [
  "Textbooks & Reviewers",
  "Supplies & Stationery",
  "Scientific Calculators",
  "Gadgets & Tech",
  "Uniforms",
  "Project Materials",
  "Foods",
] as const;

export type Category = (typeof categories)[number];

export const locations = [
  "Library",
  "PHL Lobby",
  "CEU Square",
  "Canteen",
  "Gate 1",
  "Gate 3",
  "Gate 4",
] as const;

export type Location = (typeof locations)[number];

export const conditions = [
  "Brand New",
  "Used - Like New",
  "Used - Excellent",
  "Used - Good",
] as const;

export type Condition = (typeof conditions)[number];

export type Listing = {
	id: string;
	title: string;
	category: Category;
	price: number;
	condition: Condition;
	status: ListingStatus;
	description: string;
	images: string[];
	seller: {
		name: string;
		program: string;
	};
	location: Location[];
};

