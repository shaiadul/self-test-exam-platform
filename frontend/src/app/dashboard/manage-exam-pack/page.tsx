import { redirect } from "next/navigation";
import { getExamPacksPaginatedAction, getProfileAction } from "../../../lib/actions";
import ManageExamPackClientView from "./ManageExamPackClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ManageExamPackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const perPage = params.per_page ? parseInt(params.per_page) : 10;
  const search = params.search || undefined;

  const profile = await getProfileAction();
  const role = String(profile?.role || "").toLowerCase();

  // In manage exam pack: students must not see anything
  if (role === "student") {
    redirect("/dashboard");
  }

  const isTeacher = role === "teacher";
  const res = await getExamPacksPaginatedAction({
    page,
    per_page: perPage,
    search,
    manage: true,
    mine: isTeacher,
  });

  // The backend already filters by creator for teachers when manage=true / mine=true,
  // so we trust the response directly without re-filtering.
  const packs = res?.data || [];
  const meta = res?.meta;

  return (
    <ManageExamPackClientView
      initialPacks={packs}
      initialMeta={meta}
      currentUserId={profile?.id}
      currentUserRole={profile?.role}
      packLimit={profile?.examPackLimit}
    />
  );
}
