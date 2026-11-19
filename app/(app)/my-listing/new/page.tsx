"use client"

import { useState, type SubmitEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  ListingEditorForm,
  type ListingFormValues,
} from "@/components/Marketplace/ListingForm/ListingEditorForm"
import { CreateListingSchema } from "@/schemas/listing.schema"
import { createListing } from "./listing.server"
import { uploadImages } from "./image.server"

const emptyValues = (): ListingFormValues => ({
  title: "",
  category: "",
  condition: "",
  description: "",
  price: "",
  meetupLocations: [],
  photos: [],
})

export default function CreateListingPage() {
  const router = useRouter()

  const [values, setValues] = useState<ListingFormValues>(emptyValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateValue<K extends keyof ListingFormValues>(
    field: K,
    value: ListingFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
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
    if (isSubmitting) return

    setErrors({})
    setIsSubmitting(true)
    let errorField = "images"

    try {
      const photoFiles = values.photos.filter(
        (photo): photo is File => typeof photo !== "string"
      )

      if (photoFiles.length !== values.photos.length) {
        showErrors({ images: "Choose image files to publish a new listing." })
        return
      }

      const images = await uploadImages(photoFiles)
      const payload = {
        images,
        title: values.title,
        category: values.category,
        condition: values.condition,
        description: values.description,
        priceCentavos: values.price.trim() ? Number(values.price) : 0,
        meetupLocations: values.meetupLocations,
      }

      const result = CreateListingSchema.safeParse(payload)

      if (!result.success) {
        const nextErrors: Record<string, string> = {}

        for (const issue of result.error.issues) {
          const field = String(issue.path[0])
          nextErrors[field] ??= issue.message
        }

        showErrors(nextErrors)
        return
      }

      errorField = "form-error"

      const createdListing = await createListing({
        ...result.data,
        priceCentavos: payload.priceCentavos,
      })

      if (!createdListing.success) {
        if ("errors" in createdListing && createdListing.errors) {
          const nextErrors: Record<string, string> = {}

          for (const [field, messages] of Object.entries(
            createdListing.errors
          )) {
            if (messages?.[0]) nextErrors[field] = messages[0]
          }

          showErrors(nextErrors)
        } else {
          showErrors({
            "form-error":
              createdListing.error ?? "Unable to publish your listing.",
          })
        }

        return
      }

      const listingUrl = `/marketplace/${createdListing.slug}`

      toast.success("Listing published", {
        description: "Your listing was created successfully.",
        action: {
          label: "View listing",
          onClick: () => router.push(listingUrl),
        },
      })

      setValues(emptyValues())
      setErrors({})
    } catch {
      showErrors({
        [errorField]:
          errorField === "images"
            ? "Unable to upload your photos. Check the photo requirements and try again."
            : "Unable to publish your listing. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ListingEditorForm
      heading="Create Listing"
      subtitle="Add your item details and choose convenient meetup spots."
      submitLabel="Publish Listing"
      submittingLabel="Publishing..."
      cancelHref="/marketplace"
      values={values}
      errors={errors}
      isSubmitting={isSubmitting}
      onValueChange={updateValue}
      onPhotoErrorChange={handlePhotoErrorChange}
      onSubmit={handleSubmit}
    />
  )
}
