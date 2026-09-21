import {
  getExamPackDetailsAction,
  getExamsPaginatedAction,
  getDashboardStatsAction,
  getUserAttemptsAction,
} from "../../../../lib/actions";
import ExamPackDetailsClientView from "./ExamPackDetailsClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExamPackDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ packId?: string; page?: string; per_page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const packId = params.packId ? parseInt(params.packId) : 2;
  const page = params.page ? parseInt(params.page) : 1;
  const perPage = params.per_page ? parseInt(params.per_page) : 10;
  const search = params.search || undefined;

  const [pack, examsRes, stats, attempts] = await Promise.all([
    getExamPackDetailsAction(packId),
    getExamsPaginatedAction(packId, { page, per_page: perPage, search }),
    getDashboardStatsAction(),
    getUserAttemptsAction(),
  ]);

  return (
    <ExamPackDetailsClientView
      packId={packId}
      initialPack={pack}
      initialExams={examsRes.data || []}
      initialMeta={examsRes.meta}
      initialStats={stats}
      initialAttempts={attempts || []}
    />
  );
}
