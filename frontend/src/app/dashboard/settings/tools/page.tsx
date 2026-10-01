import { getToolsOverviewAction } from "../../../../lib/actions/tools";
import ToolsClientView from "./ToolsClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ToolsPage() {
  const overview = await getToolsOverviewAction();

  return <ToolsClientView initialOverview={overview} />;
}
