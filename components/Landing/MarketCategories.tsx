import Link from "next/link";
import { Badge } from "../ui/badge";
import { 
	Card,
	CardAction,
	CardContent,
	CardHeader,
} from "@/components/ui/card";

import { 
	ArrowUpRight,
	BookOpen,
	PenLine,
	Calculator,
	Monitor,
	Shirt,
	ToolCase,
	Cookie
} from "lucide-react";

const CORE_CATEGORIES = [
	{
		icon: BookOpen,
		category: "Textbooks & Reviewer",
		tags: ["MedTech", "Nursing", "Dentistry", "Accountancy"]
	},
	{
		icon: PenLine,
		category: "Supplies & Stationery",
		tags: ["Drafting kits", "lab notebooks", "pens"]
	},
	{
		icon: Calculator,
		category: "Scientific Calculators",
		tags: ["Casio fx-991EX", "fx991ES Plus", "Sharp"]
	},
	{
		icon: Monitor,
		category: "Gadgets & Tech",
		tags: ["iPad", "stylus pens", "charger", "mice"]
	},
	{
		icon: Shirt,
		category: "Uniform & Scrubs",
		tags: ["CEU scrubs", "clinical duty", "lab coats", "PE"]
	},
	{
		icon: ToolCase,
		category: "Project Materials",
		tags: ["Boards", "3D crafts", "kits"]
	},
	{
		icon: Cookie,
		category: "Snacks & Student Food Treats",
		tags: ["Homemade cookies", "freshly baked treats prepared by students", "thirst-quenching drinks"]
	}
];

export function MarketCategories(){
	return(
		<section id="categories" className="p-8 w-full flex flex-col">
			<p className="text-xs font-semibold uppercase text-muted-foreground">
				campus directory
			</p>
			<h2 className="font-semibold text-2xl">
				Everything you need for your semester
			</h2>
			<div className="mb-4 text-muted-foreground flex flex-col lg:flex-row gap-2 justify-between">
				<p>
					Explore items listed by fellow Escolarians across colleges
				</p>
				<p className="font-semibold text-xs">7 Core Academic Categories</p>
			</div>
			<div className="categories grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{
					CORE_CATEGORIES.map((item, index) => {
						const Icon = item.icon;

						return(
							<Link
								key={index}
								href="/auth?mode=signup"
								className="block h-full lg:last:col-span-2"
							>
								<Card className='h-full'>
									<CardHeader>
										<Card className='p-2 w-fit'>
											<Icon />
										</Card>
										<CardAction>
											<ArrowUpRight />
										</CardAction>
									</CardHeader>
									<CardContent>
										<h3 className="text-lg font-medium mb-2">{item.category}</h3>
										<div className="tags flex flex-wrap gap-1">
											{
												item.tags.map((tag) => {
													return(
														<Badge key={tag}>
															{tag}
														</Badge>
													);
												})
											}
										</div>
									</CardContent>
								</Card>
							</Link>
						);
					})
				}
			</div>
		</section>
	);
}
