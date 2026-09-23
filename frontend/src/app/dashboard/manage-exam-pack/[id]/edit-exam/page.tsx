import { redirect } from "next/navigation";
import {
  getExamDetailsAction,
  getExamPackDetailsAction,
  getProfileAction,
  getQuestionsAction,
  getSystemAssetsAction,
} from "../../../../../lib/actions";
import EditExamClientView from "./EditExamClientView";

export default async function EditExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ examId?: string }>;
}) {
  const { id } = await params;
  const { examId } = await searchParams;
  const packId = id ? parseInt(id) : 0;
  const eId = examId || "";

  const profile = await getProfileAction();
  const role = String(profile?.role || "").toLowerCase();

  // In manage exam pack: students must not see anything
  if (role === "student") {
    redirect("/dashboard");
  }

  const [assets, exam, questions, pack] = await Promise.all([
    getSystemAssetsAction(),
    eId ? getExamDetailsAction(eId) : Promise.resolve(null),
    eId ? getQuestionsAction(eId) : Promise.resolve([]),
    role === "teacher" && packId ? getExamPackDetailsAction(packId) : Promise.resolve(null),
  ]);

  // Teachers can only edit their own exams or exams in their own packs
  if (role === "teacher") {
    const isExamCreator = exam?.createdBy && Number(exam.createdBy) === Number(profile?.id);
    const isPackOwner = pack?.createdBy && Number(pack.createdBy) === Number(profile?.id);
    if (!isExamCreator && !isPackOwner) {
      redirect("/dashboard/manage-exam-pack");
    }
  }

  return (
    <EditExamClientView
      packId={packId}
      examId={eId}
      initialAssets={assets || []}
      initialExam={exam}
      questionCount={Array.isArray(questions) ? questions.length : 0}
    />
  );
}
