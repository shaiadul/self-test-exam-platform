"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaChartPie, FaMoneyBillWave, FaPlus, FaListUl, FaCalendarAlt } from "react-icons/fa";
import { PageContainer } from "../../../../components/common/PageContainer";
import { getTransactionsAction, getFinancialSummaryAction, createTransactionAction } from "../../../../lib/actions";
import { Input } from "../../../../components/ui/Input";
import CustomSelect from "../../../../components/ui/CustomSelect";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export default function FinancialReportPage() {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [txType, setTxType] = useState("income");
  const [txAmount, setTxAmount] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, txsRes] = await Promise.all([
        getFinancialSummaryAction(),
        getTransactionsAction(),
      ]);
      setSummary(sumRes);
      if (Array.isArray(txsRes)) {
        setTransactions(txsRes);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load financial records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

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
      if (res.success) {
        setTxAmount("");
        setTxDesc("");
        toast.success("Transaction added successfully.");
        loadData();
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

  return (
    <PageContainer className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Report</h1>
        <p className="text-gray-500 font-medium">Manage organization ledger records, income, and expenditures.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#dd6b01]"></div>
        </div>
      ) : (
        <>
          {/* ---- Summary Stats Grid ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Income</span>
                <p className="text-2xl font-black text-green-600">${summary?.totalIncome?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-lg">
                <FaMoneyBillWave />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Expenditure</span>
                <p className="text-2xl font-black text-red-600">${summary?.totalExpenditure?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-lg">
                <FaMoneyBillWave />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Net Income</span>
                <p className="text-2xl font-black text-[#dd6b01]">${summary?.netIncome?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#dd6b01] flex items-center justify-center text-lg">
                <FaChartPie />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* ---- Form to Log Transaction ---- */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-lg space-y-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-2">
                <FaPlus className="text-[#dd6b01] text-sm" /> Record New Entry
              </h3>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <CustomSelect
                  label="Type"
                  options={["income", "expenditure"]}
                  value={txType}
                  onChange={(val) => setTxType(val)}
                />

                <Input
                  label="Amount ($)"
                  type="number"
                  step="0.01"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0.00"
                />

                <Input
                  label="Description"
                  type="text"
                  required
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="e.g. Hosting billing"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#dd6b01] text-white hover:bg-orange-600 font-bold rounded-2xl shadow-lg shadow-orange-500/10 transition mt-4 disabled:bg-orange-300 cursor-pointer"
                >
                  {submitting ? "Logging..." : "Log Transaction"}
                </button>
              </form>
            </div>

            {/* ---- Ledger Table ---- */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FaListUl className="text-[#dd6b01] text-sm" /> Transaction History
              </h3>

              <div className="overflow-x-auto bg-white border border-gray-100 rounded-3xl shadow-lg">
                <table className="min-w-full border-collapse">
                  <thead className="bg-[#fff4ec] text-[#dd6b01] border-b border-orange-100/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#ffedd5]/25 transition font-semibold">
                        <td className="px-6 py-4 text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                          <FaCalendarAlt className="text-gray-300" />
                          {new Date(tx.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{tx.description}</td>
                        <td className="px-6 py-4 text-xs">
                          <span className={`px-2.5 py-1 rounded-full font-bold border uppercase tracking-wider ${
                            tx.type === "income"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-sm font-black ${
                          tx.type === "income" ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {transactions.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <p className="font-semibold text-gray-600">No transactions recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
