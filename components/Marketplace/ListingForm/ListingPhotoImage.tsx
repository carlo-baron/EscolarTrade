"use client"

import { useEffect, useRef } from "react"

export type ListingPhoto = File | string

type ListingPhotoImageProps = {
  photo: ListingPhoto
  alt: string
  className?: string
}

export function ListingPhotoImage({
  photo,
  alt,
  className,
}: ListingPhotoImageProps) {
  const image = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (typeof photo === "string") return

    const url = URL.createObjectURL(photo)
    if (image.current) image.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [photo])

  // Files use local object URLs; saved listing photos are already safe remote URLs.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={image}
      src={typeof photo === "string" ? photo : undefined}
      alt={alt}
      className={className}
    />
  )
}
