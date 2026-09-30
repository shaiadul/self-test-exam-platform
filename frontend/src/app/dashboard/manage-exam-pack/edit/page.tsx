import { redirect } from "next/navigation";
import { getExamPackDetailsAction, getProfileAction } from "../../../../lib/actions";
import EditExamPackClientView from "./EditExamPackClientView";

export default async function EditExamPackPage({
  searchParams,
}: {
  searchParams: Promise<{ packId?: string }>;
}) {
  const profile = await getProfileAction();
  const role = String(profile?.role || "").toLowerCase();

  // In manage exam pack: students must not see anything
  if (role === "student") {
    redirect("/dashboard");
  }

  const { packId: packIdVal } = await searchParams;
  const packId = packIdVal ? parseInt(packIdVal) : 0;

  const pack = packId ? await getExamPackDetailsAction(packId) : null;

  // Teachers can only edit their own packs
  if (role === "teacher" && pack?.createdBy && Number(pack.createdBy) !== Number(profile?.id)) {
    redirect("/dashboard/manage-exam-pack");
  }

  return <EditExamPackClientView packId={packId} initialPack={pack} />;
}
