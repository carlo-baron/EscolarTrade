import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export function LikeButton({ like, onClick } : { like: boolean; onClick: (state: boolean) => void; }){
	return(
		<Button
			variant="secondary"
			className="absolute top-2 right-2 z-21"
			onClick={(e) => {
				e.preventDefault();	

				onClick(!like)
			}}
		><Heart 
				stroke="red"
				fill={like ? "red" : "none"}
			/></Button>
	);
}
