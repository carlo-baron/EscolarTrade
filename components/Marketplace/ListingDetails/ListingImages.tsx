"use client"

import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { ListingType } from "@/schemas/listing.schema"

export function ListingImages({
	listing
}: {
	listing: ListingType
}) {
	const { images, title } = listing;
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="w-full lg:w-[60%]">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-sm">
				<Badge className="absolute top-4 left-4">{listing.condition}</Badge>
        <img
          src={selectedImage}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      <ToggleGroup
        value={[selectedImage]}
        onValueChange={(value) => {
					if (value.length === 0) return;
          if (value) setSelectedImage(value[0])
        }}
        className="mt-3 grid w-full grid-cols-4 gap-2"
      >
        {images.slice(0, 4).map((image, index) => (
          <ToggleGroupItem
            key={image}
            value={image}
						className={`
							h-auto w-full overflow-hidden rounded-sm p-0
							${selectedImage === image ? "ring-2" : ""}
						`}
          >
            <div className="aspect-square w-full">
              <img
                src={image}
                alt={`${title} image ${index + 1}`}
                className={`${selectedImage !== image ? "blur-[1px]" : "" } h-full w-full object-cover`}
              />
            </div>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
