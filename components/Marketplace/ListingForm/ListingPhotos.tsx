"use client"

import { useRef, useState } from "react"
import { Plus, UploadCloud, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import {
  ACCEPTED_IMAGE_TYPES,
  ImageFileSchema,
  MAX_PHOTOS,
  MIN_WIDTH,
  MAX_WIDTH,
  MIN_HEIGHT,
  MAX_HEIGHT,
} from "@/schemas/image-file.schema"
import { ListingFormSection } from "./ListingFormSection"
import { ListingPhotoImage } from "./ListingPhotoImage"

type ListingPhotosProps = {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
  error: string
  onErrorChange: (error: string) => void
}

export function ListingPhotos({
  photos,
  onPhotosChange,
  error,
  onErrorChange,
}: ListingPhotosProps) {
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  function addPhotos(files: FileList | null) {
    if (!files?.length) return

    const additions: File[] = []
    const messages: string[] = []
    for (const file of Array.from(files)) {
      const validation = ImageFileSchema.safeParse(file)
      if (!validation.success) {
        messages.push(...validation.error.issues.map((issue) => issue.message))
        continue
      }
      if (photos.length + additions.length >= MAX_PHOTOS) {
        messages.push(`You can add up to ${MAX_PHOTOS} photos.`)
        break
      }
      additions.push(file)
    }
    onPhotosChange([...photos, ...additions])
    onErrorChange([...new Set(messages)].join(" "))
    if (fileInput.current) fileInput.current.value = ""
  }

  function removePhoto(index: number) {
    onPhotosChange(photos.filter((_, photoIndex) => photoIndex !== index))
    onErrorChange("")
  }

  return (
    <ListingFormSection
      id="photos-heading"
      title="1. Photos"
      description={`Upload ${MAX_PHOTOS} photos of your item. First photo will be the cover.`}
    >
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed bg-muted/20 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring hover:border-primary/50 hover:bg-primary/5",
            dragging && "border-primary bg-primary/5",
            error && "border-destructive"
          )}
          data-dragging={dragging}
          data-invalid={!!error}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            addPhotos(event.dataTransfer.files)
          }}
        >
          <input
            ref={fileInput}
            id="photos"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            aria-label="Add listing photos"
            aria-describedby="photos-hint photos-error"
            aria-invalid={!!error}
            onChange={(event) => addPhotos(event.target.files)}
          />
          <div className="pointer-events-none flex min-h-30 flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted">
              <UploadCloud className="size-5" aria-hidden="true" />
            </span>
            <p className="text-sm">Click to upload or drag images here</p>
            <p id="photos-hint" className="text-xs text-muted-foreground">
              JPG, PNG or WebP, up to 2 MB each. {MIN_WIDTH}–{MAX_WIDTH} px wide
              and {MIN_HEIGHT}–{MAX_HEIGHT} px high.
            </p>
          </div>
        </div>
        <FieldError id="photos-error">{error}</FieldError>
        <div className="grid grid-cols-3 gap-2.5 min-[600px]:grid-cols-4 min-[600px]:gap-3.5">
          {photos.map((photo, index) => (
            <div
              key={`${photo.name}-${photo.lastModified}-${index}`}
              className="relative aspect-square w-full min-w-0 overflow-hidden rounded-lg border bg-muted"
            >
              <button
                type="button"
                className="h-full w-full outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset"
                aria-label={
                  index === 0
                    ? `${photo.name}, cover photo`
                    : `Make ${photo.name} the cover photo`
                }
                onClick={() =>
                  onPhotosChange([
                    photo,
                    ...photos.filter((_, photoIndex) => photoIndex !== index),
                  ])
                }
              >
                <ListingPhotoImage
                  file={photo}
                  alt={photo.name}
                  className="h-full w-full object-cover"
                />
              </button>
              {index === 0 && (
                <Badge className="pointer-events-none absolute top-2 left-2">
                  Cover
                </Badge>
              )}
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                className="absolute top-2 right-2"
                aria-label={`Remove ${photo.name}`}
                onClick={() => removePhoto(index)}
              >
                <X />
              </Button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="relative flex aspect-square w-full min-w-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed bg-muted/20 text-muted-foreground transition-colors outline-none hover:border-primary/50 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Plus className="size-5" aria-hidden="true" />
              <span className="text-xs">Add Photo</span>
            </button>
          )}
        </div>
        {photos.length > 1 && (
          <p className="text-xs text-muted-foreground">
            Click a photo to make it the cover.
          </p>
        )}
      </div>
    </ListingFormSection>
  )
}
