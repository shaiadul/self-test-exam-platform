import { getExamPackDetailsAction, getExamsAction, getDashboardStatsAction } from "../../../../lib/actions";
import ExamPackDetailsClientView from "./ExamPackDetailsClientView";

export default async function ExamPackDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ packId?: string }>;
}) {
  const { packId: packIdVal } = await searchParams;
  const packId = packIdVal ? parseInt(packIdVal) : 2;

  const [pack, liveExams, stats] = await Promise.all([
    getExamPackDetailsAction(packId),
    getExamsAction(packId),
    getDashboardStatsAction(),
  ]);

  return (
    <ExamPackDetailsClientView
      initialPack={pack}
      initialExams={liveExams || []}
      initialStats={stats}
    />
  );
}
