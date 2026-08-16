import { getProfileAction, getDashboardStatsAction } from "../../lib/actions";
import DashboardClientView from "./DashboardClientView";

export default async function DashboardPage() {
  const profile = await getProfileAction();
  const stats = await getDashboardStatsAction();

  return <DashboardClientView initialProfile={profile} initialStats={stats} />;
}
