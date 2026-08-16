import { getAttemptDetailsAction, getQuestionsAction, getTeacherReportDetailsAction } from "../../../../lib/actions";
import ReportingDetailClientView from "./ReportingDetailClientView";

export default async function ExamInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const attemptId = Number(id);

  const attemptData = await getAttemptDetailsAction(attemptId);

  if (!attemptData) {
    return (
      <ReportingDetailClientView
        attemptId={attemptId}
        initialAttempt={null}
        initialQuestions={[]}
        initialReportDetails={null}
      />
    );
  }

  const [questions, reportDetails] = await Promise.all([
    getQuestionsAction(attemptData.examId),
    getTeacherReportDetailsAction(attemptData.examId),
  ]);

  return (
    <ReportingDetailClientView
      attemptId={attemptId}
      initialAttempt={attemptData}
      initialQuestions={questions || []}
      initialReportDetails={reportDetails}
    />
  );
}
