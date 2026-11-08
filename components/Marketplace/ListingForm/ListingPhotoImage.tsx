"use client"

import { useEffect, useRef } from "react"

type ListingPhotoImageProps = {
  file: File
  alt: string
  className?: string
}

export function ListingPhotoImage({
  file,
  alt,
  className,
}: ListingPhotoImageProps) {
  const image = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    if (image.current) image.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Object URLs are local previews, not uploaded URLs or Next.js image sources.
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={image} alt={alt} className={className} />
}
