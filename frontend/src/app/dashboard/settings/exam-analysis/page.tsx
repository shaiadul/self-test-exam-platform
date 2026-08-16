import { getAnalysisStatsAction } from "../../../../lib/actions";
import ExamAnalysisClientView from "./ExamAnalysisClientView";

export default async function ExamAnalysisPage() {
  const stats = await getAnalysisStatsAction();

  return <ExamAnalysisClientView initialStats={stats} />;
}
