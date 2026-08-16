"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FaPlus, FaListUl } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { createTransactionAction } from "../../../../lib/actions";
import { Input } from "../../../../components/ui/Input";
import CustomSelect from "../../../../components/ui/CustomSelect";

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
    <PageContainer className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Report</h1>
        <p className="text-gray-500 font-medium">Manage organization ledger records, income, and expenditures.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Income</span>
          <p className="text-3xl font-black text-emerald-600">${summary?.total_income?.toFixed(2) || "0.00"}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Expense</span>
          <p className="text-3xl font-black text-rose-500">${summary?.total_expense?.toFixed(2) || "0.00"}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Net Balance</span>
          <p className={`text-3xl font-black ${(summary?.net_balance || 0) >= 0 ? "text-[#dd6b01]" : "text-red-600"}`}>
            ${summary?.net_balance?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      {/* Main Grid: Form & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md h-fit">
          <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
            <FaPlus className="text-[#dd6b01]" /> Record Transaction
          </h3>

          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Type</label>
              <CustomSelect
                options={typeOptions}
                value={txType}
                onChange={(val) => setTxType(val)}
                placeholder="Select Type"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Amount ($)</label>
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
              <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
              <Input
                placeholder="Exam Pack Sales, Server Host, etc."
                value={txDesc}
                onChange={(e) => setTxDesc(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#dd6b01] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              {submitting ? "Submitting..." : "Add Record"}
            </button>
          </form>
        </div>

        {/* Ledger Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <FaListUl className="text-[#dd6b01]" /> Transaction History
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-6 font-bold">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                        tx.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-gray-800">{tx.description}</td>
                    <td className={`py-3.5 px-6 font-extrabold ${
                      tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-400 font-mono">
                      {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="p-8 text-center text-gray-400 font-semibold text-sm">
                No financial transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
