import { getSystemAssetsAction } from "../../../lib/actions";
import CompleteProfileClientView from "./CompleteProfileClientView";

export default async function CompleteProfilePage() {
  const assets = await getSystemAssetsAction();

  return <CompleteProfileClientView initialAssets={assets || []} />;
}
