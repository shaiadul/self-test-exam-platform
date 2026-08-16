import { getFinancialSummaryAction, getTransactionsAction } from "../../../../lib/actions";
import FinancialReportClientView from "./FinancialReportClientView";

export default async function FinancialReportPage() {
  const [summary, transactions] = await Promise.all([
    getFinancialSummaryAction(),
    getTransactionsAction(),
  ]);

  return <FinancialReportClientView initialSummary={summary} initialTransactions={transactions || []} />;
}
