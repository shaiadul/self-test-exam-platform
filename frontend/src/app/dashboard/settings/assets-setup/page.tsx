import { getSystemAssetsAction } from "../../../../lib/actions";
import AssetsSetupClientView from "./AssetsSetupClientView";

export default async function AssetsSetupPage() {
  const assets = await getSystemAssetsAction();

  return <AssetsSetupClientView initialAssets={assets || []} />;
}
