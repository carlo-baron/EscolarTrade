"use client"

import { useState, type SubmitEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Info } from "lucide-react"
import { toast } from "sonner"

import { ListingFormSection } from "@/components/Marketplace/ListingForm/ListingFormSection"
import { ListingPhotos } from "@/components/Marketplace/ListingForm/ListingPhotos"
import { ListingPreview } from "@/components/Marketplace/ListingForm/ListingPreview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CreateListingSchema } from "@/schemas/listing.schema"
import {
  categories,
  conditions,
  locations,
  type Location,
} from "@/types/market.types"
import { uploadImages } from "./image.server"
import { createListing } from "./listing.server"

export default function CreateListingPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [meetupLocations, setMeetupLocations] = useState<Location[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (isSubmitting) return
    setErrors({})
    setIsSubmitting(true)
    let errorField = "images"

    try {
      const images = await uploadImages(photos)
      const payload = {
        images,
        title,
        category,
        condition,
        description,
        priceCentavos: price.trim() ? Number(price) : 0,
        meetupLocations,
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
      setTitle("")
      setCategory("")
      setCondition("")
      setDescription("")
      setPrice("")
      setMeetupLocations([])
      setPhotos([])
      setErrors({})
    } catch (error) {
      console.log(error)
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
    <main className="bg-muted/25">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 min-[600px]:px-6 min-[600px]:py-8">
        <div className="mb-7 space-y-2">
          <h1 className="font-heading text-2xl leading-tight font-semibold tracking-tight">
            Create Listing
          </h1>
          <p className="text-sm text-muted-foreground">
            Add your item details and choose convenient meetup spots.
          </p>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="grid items-start gap-6 min-[900px]:grid-cols-[minmax(0,2.08fr)_minmax(0,1fr)]"
        >
          <div className="flex min-w-0 flex-col gap-6">
            <ListingPhotos
              photos={photos}
              onPhotosChange={setPhotos}
              error={errors.images ?? ""}
              onErrorChange={(error) =>
                setErrors((current) => ({ ...current, images: error }))
              }
            />

            <ListingFormSection id="details-heading" title="2. Item Details">
              <FieldGroup>
                <Field>
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </FieldLabel>
                    <span
                      id="title-count"
                      className="text-xs text-muted-foreground"
                    >
                      {title.length} / 100
                    </span>
                  </div>
                  <Input
                    id="title"
                    className="h-9"
                    name="title"
                    required
                    minLength={5}
                    maxLength={100}
                    placeholder="e.g. Principles of Anatomy and Physiology (15th Global Edition)"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    aria-invalid={!!errors.title}
                    aria-describedby="title-count title-error"
                  />
                  <FieldError id="title-error">{errors.title}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </FieldLabel>
                  <NativeSelect
                    id="category"
                    name="category"
                    required
                    className="w-full [&_select]:h-9"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    aria-invalid={!!errors.category}
                    aria-describedby="category-error"
                  >
                    <NativeSelectOption value="" disabled>
                      Select a category
                    </NativeSelectOption>
                    {categories.map((item) => (
                      <NativeSelectOption key={item} value={item}>
                        {item}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldError id="category-error">{errors.category}</FieldError>
                </Field>
                <Field>
                  <span id="condition-label" className="text-sm font-medium">
                    Condition <span className="text-destructive">*</span>
                  </span>
                  <ToggleGroup
                    id="condition"
                    tabIndex={-1}
                    multiple={false}
                    value={condition ? [condition] : []}
                    onValueChange={(values) => setCondition(values[0] ?? "")}
                    variant="outline"
                    aria-labelledby="condition-label"
                    aria-invalid={!!errors.condition}
                    aria-describedby="condition-error"
                    className="grid w-full grid-cols-2 gap-2 min-[600px]:grid-cols-4"
                  >
                    {conditions.map((item) => (
                      <ToggleGroupItem
                        key={item}
                        type="button"
                        value={item}
                        aria-invalid={!!errors.condition}
                        className="min-h-10 w-full min-w-0 px-2 text-xs font-normal aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                      >
                        {item}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <FieldError id="condition-error">
                    {errors.condition}
                  </FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    maxLength={3000}
                    rows={4}
                    className="min-h-24 resize-y"
                    placeholder="Tell buyers about your item, its condition, and any markings or flaws."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    aria-invalid={!!errors.description}
                    aria-describedby="description-hint description-error"
                  />
                  <FieldDescription id="description-hint" className="text-xs">
                    Describe condition, edition, markings, or notes for the
                    buyer.
                  </FieldDescription>
                  <FieldError id="description-error">
                    {errors.description}
                  </FieldError>
                </Field>
              </FieldGroup>
            </ListingFormSection>

            <ListingFormSection id="price-heading" title="3. Price">
              <Field>
                <FieldLabel htmlFor="priceCentavos">
                  Price (PHP) <span className="text-destructive">*</span>
                </FieldLabel>
                <InputGroup className="h-12 max-w-xs">
                  <InputGroupAddon className="pl-3 text-foreground">
                    ₱
                  </InputGroupAddon>
                  <InputGroupInput
                    id="priceCentavos"
                    name="price"
                    type="number"
                    inputMode="decimal"
                    required
                    min={1}
                    max={1000000}
                    step="0.01"
                    placeholder="0.00"
                    className="font-semibold"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    aria-invalid={!!errors.priceCentavos}
                    aria-describedby="price-hint price-error"
                  />
                </InputGroup>
                <FieldDescription id="price-hint" className="text-xs">
                  Cash or mobile transfer upon meetup.
                </FieldDescription>
                <FieldError id="price-error">{errors.priceCentavos}</FieldError>
              </Field>
            </ListingFormSection>

            <ListingFormSection
              id="meetup-heading"
              title="4. Meetup Spots"
              description="Choose convenient locations. Confirm the meetup time and place with the buyer in chat."
            >
              <Field>
                <div
                  id="meetupLocations"
                  role="group"
                  tabIndex={-1}
                  aria-labelledby="meetup-heading"
                  aria-describedby="meetup-hint meetup-error"
                  className="grid grid-cols-2 gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 min-[600px]:grid-cols-3 min-[1200px]:grid-cols-4"
                >
                  {locations.map((location, index) => {
                    const checked = meetupLocations.includes(location)
                    return (
                      <FieldLabel
                        key={location}
                        htmlFor={`meetup-${index}`}
                        className={cn(
                          "flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-normal transition-colors hover:bg-muted/50 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                          checked && "border-primary bg-primary/5",
                          !checked &&
                            meetupLocations.length >= 3 &&
                            "cursor-not-allowed opacity-50"
                        )}
                      >
                        <Checkbox
                          id={`meetup-${index}`}
                          name="meetupLocations"
                          value={location}
                          checked={checked}
                          disabled={!checked && meetupLocations.length >= 3}
                          onCheckedChange={(selected) =>
                            setMeetupLocations((current) =>
                              selected
                                ? [...current, location]
                                : current.filter((item) => item !== location)
                            )
                          }
                        />
                        {location}
                      </FieldLabel>
                    )
                  })}
                </div>
                <FieldDescription id="meetup-hint" className="text-xs">
                  Select up to 3 meetup spots. {meetupLocations.length} / 3
                  selected.
                </FieldDescription>
                <FieldError id="meetup-error">
                  {errors.meetupLocations}
                </FieldError>
              </Field>
            </ListingFormSection>
          </div>

          <ListingPreview
            title={title}
            category={category}
            condition={condition}
            description={description}
            price={price}
            meetupLocations={meetupLocations}
            imageFile={photos[0]}
          />

          <div className="space-y-4 min-[900px]:col-start-1">
            {errors["form-error"] && (
              <Alert
                id="form-error"
                variant="destructive"
                role="alert"
                tabIndex={-1}
              >
                <Info />
                <AlertTitle>Listing could not be published</AlertTitle>
                <AlertDescription>{errors["form-error"]}</AlertDescription>
              </Alert>
            )}
            <div className="flex items-center justify-between gap-4 border-t pt-6">
              <Button
                variant="ghost"
                nativeButton={false}
                className="min-h-11 px-5"
                render={<Link href="/marketplace" />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="min-h-11 px-5"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Publish Listing"}{" "}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
