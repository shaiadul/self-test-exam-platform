import { redirect } from "next/navigation";
import { getExamPackDetailsAction, getProfileAction, getSystemAssetsAction } from "../../../../../lib/actions";
import AddExamClientView from "./AddExamClientView";

export default async function AddExamPage({
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

  // Teachers can only add exams to their own packs
  if (role === "teacher") {
    const pack = await getExamPackDetailsAction(packId);
    if (pack?.createdBy && Number(pack.createdBy) !== Number(profile?.id)) {
      redirect("/dashboard/manage-exam-pack");
    }
  }

  const assets = await getSystemAssetsAction();

  return <AddExamClientView packId={packId} initialAssets={assets || []} />;
}
