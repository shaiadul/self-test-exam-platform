import { getUserAttemptsAction } from "../../../lib/actions";
import ReportingClientView from "./ReportingClientView";

export default async function ExamReportPage() {
  const reports = await getUserAttemptsAction();

  return <ReportingClientView initialReports={reports || []} />;
}
