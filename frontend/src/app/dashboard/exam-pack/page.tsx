import { getExamPacksPaginatedAction } from "../../../lib/actions";
import ExamPackClientView from "./ExamPackClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ExamPackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string; search?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const perPage = params.per_page ? parseInt(params.per_page) : 12;
  const search = params.search || undefined;
  const category = params.category || undefined;

  const res = await getExamPacksPaginatedAction({ page, per_page: perPage, search, category });

  return (
    <ExamPackClientView
      initialPacks={res.data}
      initialMeta={res.meta}
    />
  );
}

