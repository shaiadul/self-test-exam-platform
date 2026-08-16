import { getExamDetailsAction, getSystemAssetsAction } from "../../../../../lib/actions";
import EditExamClientView from "./EditExamClientView";

export default async function EditExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ examId?: string }>;
}) {
  const { id } = await params;
  const { examId } = await searchParams;
  const packId = id ? parseInt(id) : 0;
  const eId = examId || "";

  const [assets, exam] = await Promise.all([
    getSystemAssetsAction(),
    eId ? getExamDetailsAction(eId) : Promise.resolve(null),
  ]);

  return (
    <EditExamClientView
      packId={packId}
      examId={eId}
      initialAssets={assets || []}
      initialExam={exam}
    />
  );
}
