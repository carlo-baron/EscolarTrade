import { EditListingClient } from "@/components/Marketplace/EditListingClient";
import { getListingByIdForEdit } from "@/lib/marketplace/listings.service";

interface EditListingPageProps {
  params: Promise<{ listingId: string }>;
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const { listingId } = await params;

  const listing = await getListingByIdForEdit(listingId);

  if (!listing) {
    return <p className="p-6">Listing not found.</p>;
  }

  return <EditListingClient listing={listing} />;
}
