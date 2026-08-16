import { getExamDetailsAction, getQuestionsAction } from "../../../../../lib/actions";
import TakeExamClientView from "./TakeExamClientView";

export default async function ExamTakingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [exam, liveQuestions] = await Promise.all([
    getExamDetailsAction(id),
    getQuestionsAction(id),
  ]);

  return (
    <TakeExamClientView
      examId={id}
      initialExam={exam}
      initialQuestions={liveQuestions || []}
    />
  );
}
