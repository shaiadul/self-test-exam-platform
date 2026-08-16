import { getTeacherReportsAction } from "../../../lib/actions";
import TeacherReportClientView from "./TeacherReportClientView";

export default async function TeacherReportPage() {
  const reports = await getTeacherReportsAction();

  return <TeacherReportClientView initialReports={reports || []} />;
}
