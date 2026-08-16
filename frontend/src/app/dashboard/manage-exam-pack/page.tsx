import { getExamPacksAction } from "../../../lib/actions";
import ManageExamPackClientView from "./ManageExamPackClientView";

export default async function ManageExamPackPage() {
  const packs = await getExamPacksAction();

  return <ManageExamPackClientView initialPacks={packs || []} />;
}
