"use server"

import { requireSession } from "@/lib/auth/session"
import { cloudinary } from "@/lib/cloudinary"
import { MAX_PHOTOS } from "@/schemas/image-file.schema"
import { ImageSchema } from "@/schemas/image.schema"

async function uploadValidatedImage(image: File): Promise<string> {
  const buffer = Buffer.from(await image.arrayBuffer())

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", overwrite: false },
      (error, result) => {
        if (error) return reject(error)
        if (!result?.secure_url)
          return reject(new Error("Image upload failed."))
        resolve(result.secure_url)
      }
    )
    stream.on("error", reject)
    stream.end(buffer)
  })
}

export async function uploadImage(image: File): Promise<string> {
  await requireSession()
  const validatedImage = await ImageSchema.parseAsync(image)
  return uploadValidatedImage(validatedImage)
}

export async function uploadImages(images: File[]): Promise<string[]> {
  await requireSession()
  const validatedImages = await ImageSchema.array()
    .min(1)
    .max(MAX_PHOTOS)
    .parseAsync(images)

  return Promise.all(validatedImages.map(uploadValidatedImage))
}
