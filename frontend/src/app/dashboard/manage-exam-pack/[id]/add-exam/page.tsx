import { getSystemAssetsAction } from "../../../../../lib/actions";
import AddExamClientView from "./AddExamClientView";

export default async function AddExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const packId = id ? parseInt(id) : 0;

  const assets = await getSystemAssetsAction();

  return <AddExamClientView packId={packId} initialAssets={assets || []} />;
}
