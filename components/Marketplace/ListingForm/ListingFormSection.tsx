import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"

export function ListingFormSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id}>
      <Card className="gap-4 py-5">
        <CardHeader className="mx-5 border-b px-0 pb-3.5">
          <h2 id={id} className="font-heading text-base font-semibold">
            {title}
          </h2>
          {description && (
            <CardDescription className="text-xs leading-relaxed">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="px-5">{children}</CardContent>
      </Card>
    </section>
  )
}
