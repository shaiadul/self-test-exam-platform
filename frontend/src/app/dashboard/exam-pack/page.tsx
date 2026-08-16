import { getExamPacksAction } from "../../../lib/actions";
import ExamPackClientView from "./ExamPackClientView";

export default async function ExamPackPage() {
  const packs = await getExamPacksAction();

  return <ExamPackClientView initialPacks={packs || []} />;
}
