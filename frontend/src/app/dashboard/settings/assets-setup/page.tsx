import { getSystemAssetsAction, getInstitutionSuggestionsAction } from "../../../../lib/actions";
import AssetsSetupClientView from "./AssetsSetupClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AssetsSetupPage() {
  const [assets, suggestions] = await Promise.all([
    getSystemAssetsAction(),
    getInstitutionSuggestionsAction(), // all statuses visible to admin
  ]);

  return (
    <AssetsSetupClientView
      initialAssets={assets || []}
      initialSuggestions={suggestions || []}
    />
  );
}
