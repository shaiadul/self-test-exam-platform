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

  const [profile, res] = await Promise.all([
    getProfileAction(),
    getExamPacksPaginatedAction({ page, per_page: perPage, search, mine: true }),
  ]);

  let packs = res?.data || [];
  let meta = res?.meta;

  if (profile && String(profile.role).toLowerCase() === "teacher") {
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
    />
  );
}
