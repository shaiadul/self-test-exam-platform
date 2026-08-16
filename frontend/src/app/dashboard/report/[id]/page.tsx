import { getTeacherReportDetailsAction } from "../../../../lib/actions";
import TeacherReportDetailClientView from "./TeacherReportDetailClientView";

export default async function SingleExamReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getTeacherReportDetailsAction(id);

  return <TeacherReportDetailClientView examId={id} initialReport={report} />;
}
