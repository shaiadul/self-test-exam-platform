"use client";

import { FaChartPie, FaMoneyBillWave } from "react-icons/fa";

export default function FinancialReportPage() {
  const totalIncome = 12000;
  const totalExpenditure = 4500;
  const netIncome = totalIncome - totalExpenditure;

  return (
    <div className="p-6 md:p-10 space-y-6">
      <h1 className="text-3xl font-bold text-[#dd6b01]">Financial Report</h1>
      <p className="text-gray-500">Organizer income and expense overview</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
          <FaMoneyBillWave className="text-green-600 text-3xl mb-2" />
          <h3 className="text-gray-700 font-semibold">Total Income</h3>
          <p className="text-gray-900 font-bold text-xl">${totalIncome}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
          <FaMoneyBillWave className="text-red-600 text-3xl mb-2" />
          <h3 className="text-gray-700 font-semibold">Total Expenditure</h3>
          <p className="text-gray-900 font-bold text-xl">${totalExpenditure}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center">
          <FaChartPie className="text-orange-600 text-3xl mb-2" />
          <h3 className="text-gray-700 font-semibold">Net Income</h3>
          <p className="text-gray-900 font-bold text-xl">${netIncome}</p>
        </div>
      </div>
    </div>
  );
}
