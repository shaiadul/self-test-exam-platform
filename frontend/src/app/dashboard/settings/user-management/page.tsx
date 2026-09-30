import { adminGetUsersPaginatedAction } from "../../../../lib/actions";
import UserManagementClientView from "./UserManagementClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const perPage = params.per_page ? parseInt(params.per_page) : 10;
  const search = params.search || undefined;

  const res = await adminGetUsersPaginatedAction({ page, per_page: perPage, search });

  return (
    <UserManagementClientView
      initialUsers={res.data}
      initialMeta={res.meta}
    />
  );
}
