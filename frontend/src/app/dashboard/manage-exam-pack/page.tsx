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

  let packs = res?.data || [];
  let meta = res?.meta;

  if (isTeacher && profile?.id) {
    packs = packs.filter(
      (p: any) => p.createdBy && Number(p.createdBy) === Number(profile.id)
    );
    if (meta) {
      meta = {
        ...meta,
        total_items: packs.length,
        total_pages: Math.max(1, Math.ceil(packs.length / perPage)),
      };
    }
  }

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
