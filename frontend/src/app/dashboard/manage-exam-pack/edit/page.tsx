import { getExamPackDetailsAction } from "../../../../lib/actions";
import EditExamPackClientView from "./EditExamPackClientView";

export default async function EditExamPackPage({
  searchParams,
}: {
  searchParams: Promise<{ packId?: string }>;
}) {
  const { packId: packIdVal } = await searchParams;
  const packId = packIdVal ? parseInt(packIdVal) : 0;

  const pack = packId ? await getExamPackDetailsAction(packId) : null;

  return <EditExamPackClientView packId={packId} initialPack={pack} />;
}
