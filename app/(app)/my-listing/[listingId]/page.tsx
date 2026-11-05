import { requireListingOwner } from "@/lib/auth/session"
// NOTES
// DESIGN: https://stitch.google.com/projects/8019857299474086472 named Chat
// STACK: Nextjs, shadcn, tailwind
// AI: AGENTS.md
// Only make main body not the header and footer (it's for layout)
// make design responsive, mobile view provided by the ui design
// Only edit 1 FILE at a time, never edit other files, not assigned to you

interface EditListingProps{
	params: Promise<{ listingId: string }>
}

export default async function EditListingPage({ params } : EditListingProps){
	const { listingId } = await params;
	await requireListingOwner(listingId);

	return(
		<main></main>	
	);
}
