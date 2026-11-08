import "server-only"
import { z } from "zod"
import sharp from "sharp"
import {
  ImageFileSchema,
  MIN_WIDTH,
  MAX_WIDTH,
  MIN_HEIGHT,
  MAX_HEIGHT,
} from "@/schemas/image-file.schema"

export const ImageSchema = ImageFileSchema.pipe(
  z.instanceof(File).refine(async (file) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const { width = 0, height = 0, format } = await sharp(buffer).metadata()

      return (
        ["jpeg", "png", "webp"].includes(format ?? "") &&
        width >= MIN_WIDTH &&
        width <= MAX_WIDTH &&
        height >= MIN_HEIGHT &&
        height <= MAX_HEIGHT
      )
    } catch {
      return false
    }
  }, `Use a readable JPG, PNG or WebP image between ${MIN_WIDTH}–${MAX_WIDTH} px wide and ${MIN_HEIGHT}–${MAX_HEIGHT} px high.`)
)
