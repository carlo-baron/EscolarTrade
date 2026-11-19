"use client"

import type { SubmitEvent } from "react"
import Link from "next/link"
import { ArrowRight, Info } from "lucide-react"

import { ListingFormSection } from "@/components/Marketplace/ListingForm/ListingFormSection"
import { ListingPhotos } from "@/components/Marketplace/ListingForm/ListingPhotos"
import { ListingPreview } from "@/components/Marketplace/ListingForm/ListingPreview"
import type { ListingPhoto } from "@/components/Marketplace/ListingForm/ListingPhotoImage"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { categories, conditions, locations, type Location } from "@/types/market.types"

const categoryItems = categories.map((category) => ({
  label: category,
  value: category,
}))

export type ListingFormValues = {
  title: string
  category: string
  condition: string
  description: string
  price: string
  meetupLocations: Location[]
  photos: ListingPhoto[]
}

type ListingEditorFormProps = {
  heading: string
  subtitle: string
  submitLabel: string
  submittingLabel: string
  cancelHref: string
  values: ListingFormValues
  errors: Record<string, string>
  isSubmitting: boolean
  onValueChange: <K extends keyof ListingFormValues>(
    field: K,
    value: ListingFormValues[K]
  ) => void
  onPhotoErrorChange: (error: string) => void
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
}

export function ListingEditorForm({
  heading,
  subtitle,
  submitLabel,
  submittingLabel,
  cancelHref,
  values,
  errors,
  isSubmitting,
  onValueChange,
  onPhotoErrorChange,
  onSubmit,
}: ListingEditorFormProps) {
  return (
    <main className="bg-muted/25">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 min-[600px]:px-6 min-[600px]:py-8">
        <div className="mb-7 space-y-2">
          <h1 className="font-heading text-2xl leading-tight font-semibold tracking-tight">
            {heading}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <form
          noValidate
          onSubmit={onSubmit}
          className="grid items-start gap-6 min-[900px]:grid-cols-[minmax(0,2.08fr)_minmax(0,1fr)]"
        >
          <div className="flex min-w-0 flex-col gap-6">
            <ListingPhotos
              photos={values.photos}
              onPhotosChange={(photos) => onValueChange("photos", photos)}
              error={errors.images ?? ""}
              onErrorChange={onPhotoErrorChange}
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
                      {values.title.length} / 100
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
                    value={values.title}
                    onChange={(event) =>
                      onValueChange("title", event.target.value)
                    }
                    aria-invalid={!!errors.title}
                    aria-describedby="title-count title-error"
                  />
                  <FieldError id="title-error">{errors.title}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Select
                    name="category"
                    items={categoryItems}
                    value={values.category || null}
                    onValueChange={(value) =>
                      onValueChange("category", value ?? "")
                    }
                  >
                    <SelectTrigger
                      id="category"
                      className="h-9 w-full"
                      aria-invalid={!!errors.category}
                      aria-describedby="category-error"
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
                    value={values.condition ? [values.condition] : []}
                    onValueChange={(selected) =>
                      onValueChange("condition", selected[0] ?? "")
                    }
                    variant="outline"
                    aria-labelledby="condition-label"
                    aria-invalid={!!errors.condition}
                    aria-describedby="condition-error"
                    className="grid w-full grid-cols-2 gap-2 min-[600px]:grid-cols-4"
                  >
                    {conditions.map((condition) => (
                      <ToggleGroupItem
                        key={condition}
                        type="button"
                        value={condition}
                        aria-invalid={!!errors.condition}
                        className="min-h-10 w-full min-w-0 px-2 text-xs font-normal aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                      >
                        {condition}
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
                  <textarea
                    id="description"
                    name="description"
                    required
                    maxLength={3000}
                    rows={4}
                    placeholder="Tell buyers about your item, its condition, and any markings or flaws."
                    value={values.description}
                    onChange={(event) =>
                      onValueChange("description", event.target.value)
                    }
                    aria-invalid={!!errors.description}
                    aria-describedby="description-hint description-error"
                    className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full resize-y rounded-md border px-3 py-2 text-base shadow-xs outline-none focus-visible:ring-[3px] md:text-sm"
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
                    value={values.price}
                    onChange={(event) =>
                      onValueChange("price", event.target.value)
                    }
                    aria-invalid={!!errors.priceCentavos}
                    aria-describedby="price-hint price-error"
                  />
                </InputGroup>
                <FieldDescription id="price-hint" className="text-xs">
                  Cash or mobile transfer upon meetup.
                </FieldDescription>
                <FieldError id="price-error">
                  {errors.priceCentavos}
                </FieldError>
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
                    const checked = values.meetupLocations.includes(location)

                    return (
                      <FieldLabel
                        key={location}
                        htmlFor={`meetup-${index}`}
                        className={cn(
                          "flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-normal transition-colors hover:bg-muted/50 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                          checked && "border-primary bg-primary/5",
                          !checked &&
                            values.meetupLocations.length >= 3 &&
                            "cursor-not-allowed opacity-50"
                        )}
                      >
                        <Checkbox
                          id={`meetup-${index}`}
                          name="meetupLocations"
                          value={location}
                          checked={checked}
                          disabled={
                            !checked && values.meetupLocations.length >= 3
                          }
                          onCheckedChange={(selected) =>
                            onValueChange(
                              "meetupLocations",
                              selected
                                ? [...values.meetupLocations, location]
                                : values.meetupLocations.filter(
                                    (item) => item !== location
                                  )
                            )
                          }
                        />
                        {location}
                      </FieldLabel>
                    )
                  })}
                </div>
                <FieldDescription id="meetup-hint" className="text-xs">
                  Select up to 3 meetup spots.{" "}
                  {values.meetupLocations.length} / 3 selected.
                </FieldDescription>
                <FieldError id="meetup-error">
                  {errors.meetupLocations}
                </FieldError>
              </Field>
            </ListingFormSection>
          </div>

          <ListingPreview
            title={values.title}
            category={values.category}
            condition={values.condition}
            description={values.description}
            price={values.price}
            meetupLocations={values.meetupLocations}
            image={values.photos[0]}
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
                render={<Link href={cancelHref} />}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                size="lg"
                className="min-h-11 px-5"
                disabled={isSubmitting}
              >
                {isSubmitting ? submittingLabel : submitLabel}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
