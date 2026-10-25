import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Logo } from "../Logo";

const LandingLinks = [
	{
		name: "Categories",
		link: "#categories"
	},
	{
		name: "How It Works",
		link: "#protocols",
	},
	{
		name: "Trust & Safety",
		link: "#cta",
	},
	{
		name: "About",
		link: "/about"
	}
]

export function LandingNavbar(){
	return(
		<header>
			<nav
				className='
				bg-background
				fixed top-0 z-999
				w-full
				px-4
				py-2 lg:px-8 h-14 flex items-center justify-between
				border
				'
			>
				<Logo />

				<div className="hidden links gap-4 lg:flex text-sm text-muted-foreground">
					{
						LandingLinks.map((item, index) => {
							return(
								<Link key={index} href={item.link}>
									{item.name}	
								</Link>
							);
						})
					}
				</div>

				<div className="auth flex gap-2">
					<Link href="/auth?tab=login">
						<Button variant="outline">Log In</Button>
					</Link>
					<Link href="/auth?tab=signup">
						<Button>Sign Up</Button>
					</Link>
				</div>
			</nav>
		</header>
	);
}
