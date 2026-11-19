"use client"

import { useState, type SubmitEvent } from "react"

import type { ListingType } from "@/schemas/listing.schema"
import {
  ListingEditorForm,
  type ListingFormValues,
} from "@/components/Marketplace/ListingForm/ListingEditorForm"

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

export function EditListingClient({ listing }: EditListingClientProps) {
  const [values, setValues] = useState<ListingFormValues>(() =>
    toFormValues(listing)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    // Add your edit submission logic here.
  }

  return (
    <ListingEditorForm
      heading="Edit Listing"
      subtitle="Update your item details and meetup spots."
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      cancelHref="/my-listing"
      values={values}
      errors={errors}
      isSubmitting={false}
      onValueChange={updateValue}
      onPhotoErrorChange={handlePhotoErrorChange}
      onSubmit={handleSubmit}
    />
  )
}
