import { getUserAttemptsPaginatedAction } from "../../../lib/actions";
import ReportingClientView from "./ReportingClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExamReportPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const perPage = params.per_page ? parseInt(params.per_page) : 10;
  const search = params.search || undefined;

  const res = await getUserAttemptsPaginatedAction({ page, per_page: perPage, search });

  return (
    <ReportingClientView
      initialReports={res.data}
      initialMeta={res.meta}
    />
  );
}
