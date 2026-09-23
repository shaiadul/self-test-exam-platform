import { redirect } from "next/navigation";
import { getExamPackDetailsAction, getTeacherExamsAction, getProfileAction } from "../../../../lib/actions";
import ManageExamPackDetailClientView from "./ManageExamPackDetailClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExamPackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const packId = id ? parseInt(id) : 0;

  const profile = await getProfileAction();
  const role = String(profile?.role || "").toLowerCase();

  // In manage exam pack: students must not see anything
  if (role === "student") {
    redirect("/dashboard");
  }

  const [pack, liveExams] = await Promise.all([
    getExamPackDetailsAction(packId),
    getTeacherExamsAction(packId),
  ]);

  // Teachers can only view and manage their own packs
  if (role === "teacher" && pack?.createdBy && Number(pack.createdBy) !== Number(profile?.id)) {
    redirect("/dashboard/manage-exam-pack");
  }

  return (
    <ManageExamPackDetailClientView
      packId={packId}
      initialPack={pack}
      initialExams={liveExams || []}
    />
  );
}
