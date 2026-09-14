import { getTeacherReportDetailsAction } from "../../../../lib/actions";
import TeacherReportDetailClientView from "../../report/[id]/TeacherReportDetailClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeacherReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getTeacherReportDetailsAction(id);

  return <TeacherReportDetailClientView examId={id} initialReport={report} />;
}
