"use client"

import Link from "next/link"
import { FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Bell,
  ChevronDown,
  Heart,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react"

import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { categories } from "@/types/market.types"
import { LogoutButton } from "@/components/Auth/LogoutButton"

type MarketplaceHeaderProps = {
  user: {
    initials: string
    name: string
    subtitle: string
  }
}

const HEADER_ACTIONS = [
  { icon: MessageSquare, label: "Messages" },
  { icon: Bell, label: "Notifications" },
  { icon: Heart, label: "Saved listings" },
]

export function MarketplaceHeader({ user }: MarketplaceHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeCategory = searchParams.get("category")
  const currentSearch = searchParams.get("search") ?? ""

  function createMarketplaceUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    const query = params.toString()

    return query ? `/marketplace?${query}` : "/marketplace"
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const search = formData.get("search")?.toString().trim() ?? ""

    router.push(
      createMarketplaceUrl({
        search: search || null,
      })
    )
  }

  return (
    <header className="w-full border-b">
      <div className="flex w-full flex-wrap items-center gap-4 px-4 py-4 lg:flex-nowrap lg:px-8">
        <Logo />

        <form
          onSubmit={handleSearch}
          className="order-last flex w-full justify-center lg:order-0 lg:flex-1"
        >
          <InputGroup className="max-w-xl">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>

            <InputGroupInput
              key={currentSearch}
              name="search"
              type="search"
              aria-label="Search listings"
              placeholder="Search textbooks, calculators, uniforms, gadgets…"
              defaultValue={currentSearch}
            />
          </InputGroup>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <LogoutButton />
          {HEADER_ACTIONS.map(({ icon: Icon, label }) => (
            <Button key={label} variant="ghost" size="icon" aria-label={label}>
              <Icon />
            </Button>
          ))}
        </div>

        <div className="hidden items-center gap-2 border-l pl-4 lg:flex">
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {user.initials}
          </span>

          <div className="text-xs">
            <p className="font-semibold">{user.name}</p>
            <p className="text-muted-foreground">{user.subtitle}</p>
          </div>

          <ChevronDown className="size-4 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-muted/50">
        <nav
          aria-label="Listing categories"
          className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 lg:px-8"
        >
          <Link
            href={createMarketplaceUrl({
              category: null,
            })}
            className={cn(
              "shrink-0 border-b-2 border-transparent py-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
              !activeCategory && "border-primary text-foreground"
            )}
          >
            All Listings
          </Link>

          {categories.map((item) => (
            <Link
              key={item}
              href={createMarketplaceUrl({
                category: item,
              })}
              className={cn(
                "shrink-0 border-b-2 border-transparent py-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                activeCategory === item && "border-primary text-foreground"
              )}
            >
              {item}
            </Link>
          ))}

          <Button
            variant="ghost"
            className="my-2 ml-auto shrink-0"
            onClick={() => router.push("/listing/create")}
          >
            <Plus />
            Post a Listing
          </Button>
        </nav>
      </div>
    </header>
  )
}
