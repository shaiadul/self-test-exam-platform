import { getProfileAction, getDashboardStatsAction } from "../../lib/actions";
import DashboardClientView from "./DashboardClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const [profile, stats] = await Promise.all([
    getProfileAction(),
    getDashboardStatsAction(),
  ]);

  return <DashboardClientView initialProfile={profile} initialStats={stats} />;
}
