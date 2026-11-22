import { LandingNavbar } from "@/components/Landing/LandingNavbar"
import { Hero } from "@/components/Landing/Hero"
import { MarketCategories } from "@/components/Landing/MarketCategories"
import { CampusProtocol } from "@/components/Landing/CampusProtocol"
import { MarketplaceSnippet } from "@/components/Landing/MarketplaceSnippet"
import { CTA } from "@/components/Landing/CTA"
import { Footer, FooterLinkType } from "@/components/Landing/Footer"

const FOOTER_LINKS: FooterLinkType[] = [
	{
		title: "Categories",
		links: [
			{ label: "Textbooks & Reviewers", href: "/browse/textbooks" },
			{ label: "Supplies & Stationery", href: "/browse/nursing-medical" },
			{ label: "Scientific Calculators & Tech", href: "/browse/calculators" },
			{ label: "Gadgets & Tech", href: "/browse/dentistry" },
			{ label: "Uniforms", href: "/browse/uniforms" },
			{ label: "Project Materials", href: "/browse/materials" },
			{ label: "Foods", href: "/browse/foods" },
		],
	},
	{
		title: "Campus Trust",
		links: [
			{ label: "CEU Email Verification", href: "/trust/verification" },
			{ label: "Designated Meetup Zones", href: "/trust/meetup-zones" },
			{ label: "Honest Listing Policy", href: "/trust/honor-code" },
		],
	},
	{
		title: "Institutional",
		links: [
			{ label: "About EscolarTrade", href: "/about" },
			{ label: "Privacy Policy", href: "/privacy" },
			{ label: "Terms of Service", href: "/terms" },
		],
	},
];


export default function LandingPage() {
	return (
		<>
			<LandingNavbar />
			<main>
				<Hero />
				<MarketCategories />
				<CampusProtocol />
				<MarketplaceSnippet />
				<CTA />
			</main>
			<Footer links={FOOTER_LINKS} />
		</>
	)
}

