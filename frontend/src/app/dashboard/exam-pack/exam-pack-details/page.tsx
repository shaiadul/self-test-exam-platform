import {
  getExamPackDetailsAction,
  getExamsAction,
  getDashboardStatsAction,
  getUserAttemptsAction,
} from "../../../../lib/actions";
import ExamPackDetailsClientView from "./ExamPackDetailsClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExamPackDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ packId?: string }>;
}) {
  const { packId: packIdVal } = await searchParams;
  const packId = packIdVal ? parseInt(packIdVal) : 2;

  const [pack, liveExams, stats, attempts] = await Promise.all([
    getExamPackDetailsAction(packId),
    getExamsAction(packId),
    getDashboardStatsAction(),
    getUserAttemptsAction(),
  ]);

  return (
    <ExamPackDetailsClientView
      packId={packId}
      initialPack={pack}
      initialExams={liveExams || []}
      initialStats={stats}
      initialAttempts={attempts || []}
    />
  );
}
