import { getExamPacksAction } from "../../../lib/actions";
import ManageExamPackClientView from "./ManageExamPackClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ManageExamPackPage() {
  const packs = await getExamPacksAction();

  return <ManageExamPackClientView initialPacks={packs || []} />;
}
