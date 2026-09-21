"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FaPlus, FaListUl, FaMoneyBillWave } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import EmptyState from "../../../../components/common/EmptyState";
import { createTransactionAction } from "../../../../lib/actions";
import { Input } from "../../../../components/ui/Input";
import CustomSelect from "../../../../components/ui/CustomSelect";
import { formatDate } from "@/lib/date";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface FinancialReportClientViewProps {
  initialSummary: any;
  initialTransactions: Transaction[];
}

export default function FinancialReportClientView({ initialSummary, initialTransactions }: FinancialReportClientViewProps) {
  const [summary, setSummary] = useState<any>(initialSummary);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions || []);

  // Form states
  const [txType, setTxType] = useState("income");
  const [txAmount, setTxAmount] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(txAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.warning("Please enter a valid positive amount.");
      return;
    }
    if (!txDesc.trim()) {
      toast.warning("Please enter a description.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createTransactionAction(txType, parsedAmount, txDesc);
      if (res.success && res.transaction) {
        setTxAmount("");
        setTxDesc("");
        toast.success("Transaction added successfully.");
        setTransactions((prev) => [res.transaction, ...prev]);
        setSummary((prev: any) => {
          if (!prev) return prev;
          const currentIncome = prev.total_income || 0;
          const currentExpense = prev.total_expense || 0;
          const newIncome = txType === "income" ? currentIncome + parsedAmount : currentIncome;
          const newExpense = txType === "expense" ? currentExpense + parsedAmount : currentExpense;
          return {
            ...prev,
            total_income: newIncome,
            total_expense: newExpense,
            net_balance: newIncome - newExpense,
          };
        });
      } else {
        toast.error(res.error || "Failed to add transaction");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  const typeOptions = ["income", "expense"];

  return (
    <PageContainer className="space-y-6 animate-fadeIn pb-20 sm:pb-6">
      {/* Top Header Command Strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
              {transactions.length} Entries
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Financial Ledger &amp; Balance Sheet
          </h1>
        </div>
      </div>

      {/* Overview Metric HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Revenue
          </span>
          <p className="text-2xl font-black font-mono text-emerald-600">
            ${summary?.total_income?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Total Expenditures
          </span>
          <p className="text-2xl font-black font-mono text-rose-500">
            ${summary?.total_expense?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Net Fiscal Balance
          </span>
          <p className={`text-2xl font-black font-mono ${(summary?.net_balance || 0) >= 0 ? "text-primary" : "text-rose-600"}`}>
            ${summary?.net_balance?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      {/* Main Grid: Form & Ledger Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Form Card */}
        <div className="lg:col-span-4 bg-white p-3.5 sm:p-5 rounded border border-slate-200/80 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <FaPlus className="text-primary text-xs" /> Record Journal Entry
            </h3>
          </div>

          <form onSubmit={handleAddTransaction} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Transaction Type</label>
              <CustomSelect
                options={typeOptions}
                value={txType}
                onChange={(val) => setTxType(val)}
                placeholder="Select Type"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Amount ($ USD)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="100.00"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description / Memo</label>
              <Input
                placeholder="e.g. Exam Pack Sales, Server Host"
                value={txDesc}
                onChange={(e) => setTxDesc(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-bold font-mono text-xs rounded shadow-2xs transition cursor-pointer disabled:opacity-60"
            >
              {submitting ? "RECORDING..." : "COMMIT ENTRY"}
            </button>
          </form>
        </div>

        {/* Ledger Table */}
        <div className="lg:col-span-8 bg-white rounded-none border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                AUDITED TRANSACTION LOG
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-bold">
                {transactions.length} ENTRIES
              </span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 font-mono font-bold text-[10px] uppercase tracking-wider border-b border-slate-200/80">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        tx.type === "income" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{tx.description}</td>
                    <td className={`py-3.5 px-4 font-mono font-black ${
                      tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-400 font-mono">
                      {formatDate(tx.created_at, "MMM dd, yyyy", "Recent")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="py-6">
                <EmptyState
                  compact
                  type="reports"
                  title="No Transactions Logged"
                  description="No journal or ledger entries have been recorded yet."
                />
              </div>
            )}
          </div>

          {/* Mobile Cards View */}
          <div className="block sm:hidden divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-3.5 space-y-2 hover:bg-slate-50/50 transition">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                    tx.type === "income" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {tx.type}
                  </span>
                  <span className={`font-mono font-black text-xs ${
                    tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}${tx.amount?.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {tx.description}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {formatDate(tx.created_at, "MMM dd, yyyy", "Recent")}
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="py-6 px-4 text-center">
                <EmptyState
                  compact
                  type="reports"
                  title="No Transactions Logged"
                  description="No journal or ledger entries have been recorded yet."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
