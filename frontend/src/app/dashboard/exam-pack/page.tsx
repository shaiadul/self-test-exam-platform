import { getExamPacksAction } from "../../../lib/actions";
import ExamPackClientView from "./ExamPackClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExamPackPage() {
  const packs = await getExamPacksAction();

  return <ExamPackClientView initialPacks={packs || []} />;
}

