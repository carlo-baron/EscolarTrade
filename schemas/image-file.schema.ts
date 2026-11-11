import { z } from "zod"

export const MAX_PHOTOS = 3
export const MAX_FILE_SIZE = 2 * 1024 * 1024
export const MIN_WIDTH = 320
export const MAX_WIDTH = 1920
export const MIN_HEIGHT = 240
export const MAX_HEIGHT = 1080
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

// Browser-safe checks. ImageSchema additionally inspects the bytes on the server.
export const ImageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "Choose a non-empty image.")
  .refine((file) => file.size <= MAX_FILE_SIZE, "Image must not exceed 2MB.")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  )
