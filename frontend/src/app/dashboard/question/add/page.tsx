import {
  getExamDetailsAction,
  getExamPackDetailsAction,
  getExamPacksAction,
  getQuestionsAction,
} from "../../../../lib/actions";
import AddQuestionClientView from "./AddQuestionClientView";

export default async function AddQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ examId?: string }>;
}) {
  const { examId: examIdParam } = await searchParams;

  const [packs, exam] = await Promise.all([
    getExamPacksAction(),
    examIdParam ? getExamDetailsAction(examIdParam) : Promise.resolve(null),
  ]);

  let pack = null;
  let initialQuestions: any[] = [];

  if (exam) {
    [pack, initialQuestions] = await Promise.all([
      getExamPackDetailsAction(exam.examPackId),
      getQuestionsAction(examIdParam!),
    ]);
  }

  return (
    <AddQuestionClientView
      examIdParam={examIdParam || ""}
      initialPacks={packs || []}
      initialExam={exam}
      initialPack={pack}
      initialQuestions={initialQuestions || []}
    />
  );
}
