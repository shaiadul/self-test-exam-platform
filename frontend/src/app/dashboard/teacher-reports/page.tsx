import { getTeacherReportsAction } from "../../../lib/actions";
import TeacherReportClientView from "../report/TeacherReportClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeacherReportsPage() {
  const reports = await getTeacherReportsAction();

  return <TeacherReportClientView initialReports={reports || []} />;
}
