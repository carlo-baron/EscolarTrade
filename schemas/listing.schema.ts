import { z } from "zod";
import {
  categories,
  conditions,
  locations,
} from "@/types/market.types";

export const CreateListingSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(5, "Title must contain at least 5 characters.")
    .max(100, "Title must not exceed 100 characters.")
    .refine(
      (value) => !/[\r\n]/.test(value),
      "Title must be a single line."
    ),

  description: z
    .string()
    .trim()
    .min(1, "Enter a description.")
    .max(3000, "Description must not exceed 3,000 characters."),

  priceCentavos: z
    .number()
    .int("Price must be an integer number of centavos.")
    .min(100, "Minimum price is ₱1.")
    .max(100000000, "Maximum price is ₱1,000,000."),

  category: z.enum(categories, {
    error: "Select a valid category.",
  }),

  condition: z.enum(conditions, {
    error: "Select a valid condition.",
  }),

  meetupLocations: z
    .array(z.enum(locations))
    .min(1, "Select at least one meetup location.")
    .max(3, "Select up to three meetup locations.")
    .refine(
      (values) => new Set(values).size === values.length,
      "Meetup locations must be unique."
    ),
});

export type CreateListingInput = z.infer<
  typeof CreateListingSchema
>;
