import { Heart, ImagePlus, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Location } from "@/types/market.types"
import { ListingPhotoImage } from "./ListingPhotoImage"

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

type ListingPreviewProps = {
  title: string
  category: string
  condition: string
  description: string
  price: string
  meetupLocations: readonly Location[]
  imageFile?: File
}

export function ListingPreview({
  title,
  category,
  condition,
  description,
  price,
  meetupLocations,
  imageFile,
}: ListingPreviewProps) {
  const numericPrice = Number(price)

  return (
    <aside
      aria-labelledby="preview-heading"
      className="flex w-full max-w-md min-w-0 flex-col gap-3.5 justify-self-center min-[900px]:sticky min-[900px]:top-6 min-[900px]:max-w-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="preview-heading" className="text-sm font-semibold">
          Listing Preview
        </h2>
        <span className="text-[10px] text-muted-foreground">
          Live marketplace preview
        </span>
      </div>
      <Card className="gap-4 py-0">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {imageFile ? (
            <ListingPhotoImage
              file={imageFile}
              alt={title.trim() || "Your listing cover photo"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <ImagePlus className="size-10 stroke-1" aria-hidden="true" />
              <p className="text-xs">Your cover photo will appear here</p>
            </div>
          )}
          {condition && (
            <Badge variant="secondary" className="absolute bottom-2 left-2">
              {condition}
            </Badge>
          )}
          <span
            aria-hidden="true"
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground"
          >
            <Heart className="size-4" />
          </span>
        </div>
        <CardHeader className="gap-1 px-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {category || "Your category"}
            </p>
            <p className="shrink-0 font-semibold">
              {currency.format(
                Number.isFinite(numericPrice) && numericPrice > 0
                  ? numericPrice
                  : 0
              )}
            </p>
          </div>
          <CardTitle
            className={cn(
              "line-clamp-2 wrap-anywhere",
              !title.trim() && "text-muted-foreground"
            )}
          >
            {title.trim() || "Your listing title"}
          </CardTitle>
          <CardDescription className="truncate">
            {description.trim() || "Your item description"}
          </CardDescription>
        </CardHeader>
        <CardFooter className="p-4">
          <div className="flex w-full items-center justify-between gap-2">
            <p className="text-sm font-medium">You</p>
            <div className="flex min-w-0 flex-1 items-center justify-end text-xs text-muted-foreground">
              <MapPin size={16} className="shrink-0" aria-hidden="true" />
              <span className="truncate">
                {meetupLocations[0] || "Meetup spot"}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        How your card appears in Marketplace browsing
      </p>
    </aside>
  )
}
