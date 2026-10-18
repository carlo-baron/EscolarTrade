import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { MessageCircleX, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessagePage(){
	return(
		<section
			className="flex items-center justify-center w-full"
		>
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<MessageCircleX />
					</EmptyMedia>
					<EmptyTitle>No chat selected</EmptyTitle>
					<EmptyDescription>Browse the marketplace and chat with sellers!</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Link href="/marketplace">
						<Button>
							<Globe />
							Browse Marketplace</Button>
					</Link>
				</EmptyContent>
			</Empty>
		</section>	
	);
}
