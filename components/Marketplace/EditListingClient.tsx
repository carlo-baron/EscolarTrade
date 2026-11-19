"use client"

import { useState, type SubmitEvent } from "react"
import { toast } from "sonner"

import type { ListingType } from "@/schemas/listing.schema"
import { UpdateListingSchema } from "@/schemas/listing.schema"
import {
  ListingEditorForm,
  type ListingFormValues,
} from "@/components/Marketplace/ListingForm/ListingEditorForm"
import type { ListingPhoto } from "@/components/Marketplace/ListingForm/ListingPhotoImage"
import { uploadImages } from "@/app/(app)/my-listing/new/image.server"

import { updateListing } from "@/app/(app)/my-listing/[listingId]/listing.server"

interface EditListingClientProps {
  listing: ListingType
}

function toFormValues(listing: ListingType): ListingFormValues {
  return {
    title: listing.title,
    category: listing.category,
    condition: listing.condition,
    description: listing.description,
    price: String(listing.priceCentavos / 100),
    meetupLocations: listing.meetupLocations,
    photos: listing.images,
  }
}

function pricesMatch(left: string, right: string) {
  const leftAmount = Number(left)
  const rightAmount = Number(right)

  if (!Number.isFinite(leftAmount) || !Number.isFinite(rightAmount)) {
    return left === right
  }

  return Math.round(leftAmount * 100) === Math.round(rightAmount * 100)
}

function hasMatchingValues(
  current: ListingFormValues,
  saved: ListingFormValues
) {
  return (
    current.title === saved.title &&
    current.category === saved.category &&
    current.condition === saved.condition &&
    current.description === saved.description &&
    pricesMatch(current.price, saved.price) &&
    current.meetupLocations.length === saved.meetupLocations.length &&
    current.meetupLocations.every(
      (location, index) => location === saved.meetupLocations[index]
    ) &&
    current.photos.length === saved.photos.length &&
    current.photos.every(
      (photo, index) =>
        typeof photo === "string" && photo === saved.photos[index]
    )
  )
}

async function resolveListingImageUrls(photos: ListingPhoto[]) {
  const existingImageUrls = photos.filter(
    (photo): photo is string => typeof photo === "string"
  )
  const newPhotoFiles = photos.filter(
    (photo): photo is File => typeof photo !== "string"
  )

  if (newPhotoFiles.length === 0) return existingImageUrls

  const uploadedImageUrls = await uploadImages(newPhotoFiles)
  let uploadedImageIndex = 0

  return photos.map((photo) => {
    if (typeof photo === "string") return photo

    const uploadedImageUrl = uploadedImageUrls[uploadedImageIndex++]
    if (!uploadedImageUrl) throw new Error("Image upload did not complete.")

    return uploadedImageUrl
  })
}

export function EditListingClient({ listing }: EditListingClientProps) {
  const [values, setValues] = useState<ListingFormValues>(() =>
    toFormValues(listing)
  )
  const [savedValues, setSavedValues] = useState<ListingFormValues>(() =>
    toFormValues(listing)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSavingChanges, setIsSavingChanges] = useState(false)

  const hasUnsavedChanges = !hasMatchingValues(values, savedValues)

  function updateValue<K extends keyof ListingFormValues>(
    field: K,
    value: ListingFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function handlePhotoErrorChange(error: string) {
    setErrors((current) => {
      const next = { ...current }

      if (error) {
        next.images = error
      } else {
        delete next.images
      }

      return next
    })
  }

  function showErrors(nextErrors: Record<string, string>) {
    setErrors(nextErrors)

    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      document
        .getElementById(firstError === "images" ? "photos" : firstError)
        ?.focus()
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSavingChanges || !hasUnsavedChanges) return

    setErrors({})
    setIsSavingChanges(true)
    let errorField = "images"

    try {
      const images = await resolveListingImageUrls(values.photos)
      const payload = {
        images,
        title: values.title,
        category: values.category,
        condition: values.condition,
        description: values.description,
        priceCentavos: values.price.trim() ? Number(values.price) : 0,
        meetupLocations: values.meetupLocations,
      }
      const validation = UpdateListingSchema.safeParse(payload)

      if (!validation.success) {
        const nextErrors: Record<string, string> = {}

        for (const issue of validation.error.issues) {
          const field = String(issue.path[0])
          nextErrors[field] ??= issue.message
        }

        showErrors(nextErrors)
        return
      }

      errorField = "form-error"
      const result = await updateListing(listing.id, {
        ...validation.data,
        priceCentavos: payload.priceCentavos,
      })

      if (!result.success) {
        if ("errors" in result && result.errors) {
          const nextErrors: Record<string, string> = {}

          for (const [field, messages] of Object.entries(result.errors)) {
            if (messages?.[0]) nextErrors[field] = messages[0]
          }

          showErrors(nextErrors)
        } else {
          showErrors({
            "form-error": result.error ?? "Unable to save your listing.",
          })
        }

        return
      }

      const nextSavedValues = { ...values, photos: images }
      setValues(nextSavedValues)
      setSavedValues(nextSavedValues)
      setErrors({})
      toast.success("Changes saved", {
        description: "Your listing has been updated.",
      })
    } catch {
      showErrors({
        [errorField]:
          errorField === "images"
            ? "Unable to upload your photos. Check the photo requirements and try again."
            : "Unable to save your listing. Please try again.",
      })
    } finally {
      setIsSavingChanges(false)
    }
  }

  return (
    <ListingEditorForm
      heading="Edit Listing"
      subtitle="Update your item details and meetup spots."
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      formErrorTitle="Listing could not be saved"
      cancelHref="/my-listing"
      values={values}
      errors={errors}
      isSubmitting={isSavingChanges}
      isSubmitDisabled={!hasUnsavedChanges}
      onValueChange={updateValue}
      onPhotoErrorChange={handlePhotoErrorChange}
      onSubmit={handleSubmit}
    />
  )
}
