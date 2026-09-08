import { getExamPackDetailsAction, getExamsAction } from "../../../../lib/actions";
import ManageExamPackDetailClientView from "./ManageExamPackDetailClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExamPackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const packId = id ? parseInt(id) : 0;

  const [pack, liveExams] = await Promise.all([
    getExamPackDetailsAction(packId),
    getExamsAction(packId),
  ]);

  return (
    <ManageExamPackDetailClientView
      packId={packId}
      initialPack={pack}
      initialExams={liveExams || []}
    />
  );
}
