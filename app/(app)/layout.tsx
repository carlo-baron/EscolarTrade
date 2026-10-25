import { Suspense } from "react"
import { MarketplaceHeader } from "@/components/Marketplace/MarketPlaceHeader"
import { Footer } from "@/components/Landing/Footer"
import { FooterLinkType } from "@/components/Landing/Footer"
import { requireSession } from "@/lib/auth/session"

const FOOTER_LINKS: FooterLinkType[] = [
  {
    title: "Student Commerce",
    links: [
      { label: "Marketplace Directory", href: "/marketplace" },
      { label: "Active Listings", href: "#" },
      { label: "My Purchases", href: "#" },
      { label: "Campus Drop-off Points", href: "#" },
    ],
  },
  {
    title: "Safety & Verification",
    links: [
      { label: "Safe Meetup Locations", href: "#" },
      { label: "Report Inappropriate Item", href: "#" },
      { label: "Honest Listing Policy", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help & FAQs", href: "#" },
      { label: "Moderation Team", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
]


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireSession()
  const name = typeof session.name === "string" ? session.name : session.email ?? "Escolarian"
  return (
		<>
			<Suspense fallback={null}>
				<MarketplaceHeader
					user={{
						initials: name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase(),
						name,
						subtitle: "Verified school account",
					}}
				/>
			</Suspense>
			{children}
			<Footer links={FOOTER_LINKS}/>
		</>
	)
}

