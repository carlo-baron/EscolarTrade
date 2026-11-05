import {
  Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
	CardContent,
} from "@/components/ui/card"
import { Badge } from "../ui/badge";
import { 
	Shield,
	MailCheck,
	ShieldCheck,
	MapPinCheck,
	PhilippinePeso,
	ArrowRight
} from "lucide-react";
import { Button } from "../ui/button";

const FEATS = [
	{
		icon: MailCheck,
		name: "Institutional SSO",
		description: "Use a verified @mls.ceu.edu.ph account to message and list items."
	},
	{
		icon: MapPinCheck,
		name: "Safe Meetup Landmarks",
		description: "Pre-configured checkpoints inside Malolos campus: Library, CEU Square, Centrodome, etc."
	},
	{
		icon: ShieldCheck,
		name: "Honest Listings Policy",
		description: "Listings must describe item condition accurately. Misleading posts or misconduct can be reported and taken down."
	},
	{
		icon: PhilippinePeso,
		name: "100% Free Campus Tool",
		description: "No platform commissions or listing fees. All transaction revenue stays fully in the hands of student peers."
	}
];

export function CTA(){
	return(
		<section id="cta" className="border-b p-8 w-full">
			<Card className="bg-muted p-0">
				<CardContent className="lg:flex-row flex-col flex p-4 lg:p-10 gap-8">
					<div className="w-full lg:w-[70%] texts">
						<Badge>
							<Shield/>
							Closed Academic Network
						</Badge>
						<h2 className="font-semibold text-xl lg:text-2xl">
							Built Exclusively for CEU Malolos Students & Faculty
						</h2>
						<p className="text-sm lg:text-base text-muted-foreground mb-4">
							No outsiders, no scams, no sketchy delivery riders. Every listing and chat is bound to an active student or employee ID with verified institutional records.
						</p>
						<div className="flex flex-col lg:grid grid-cols-2 grid-rows-2 gap-4 feats w-full">
							{
								FEATS.map(item => {
									const Icon = item.icon;
									return(
										<div 
											className='flex gap-1'
											key={item.name}>
											<Icon size={22} />	
											<div className="texts">
												<p className="font-medium text-lg">{item.name}</p>
												<p className="text-sm text-muted-foreground">{item.description}</p>
											</div>
										</div>
									);
								})
							}
						</div>
					</div>
					<div className="flex items-center justify-center cta-card lg:w-[30%]">
						<Card className="w-full">
							<CardHeader>
								<p className="leading-none text-xs uppercase text-muted-foreground">get verified today</p>
								<CardTitle className="text-xl">Start Trading Safely</CardTitle>
								<CardDescription>Sign in with your official university credentials to unlock immediate browsing and instant listing.</CardDescription>
							</CardHeader>
							<CardFooter className="flex flex-col items-center">
								<Button className="w-full" size="lg">
									Join with Student Email
									<ArrowRight />
								</Button>
								<p className="text-xs text-muted-foreground font-medium">Requires CEU Gmail Account</p>
							</CardFooter>
						</Card>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
