"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
} from "recharts";

const data = [
  { name: "Exam 1", mark: 30 },
  { name: "Exam 2", mark: 55 },
  { name: "Exam 3", mark: 45 },
  { name: "Exam 4", mark: 70 },
  { name: "Exam 5", mark: 50 },
];

// Calculate average mark
const avg = data.reduce((a, b) => a + b.mark, 0) / data.length;

export default function ChartCard() {
  return (
    <div className="bg-white border border-[#dd6b01] rounded-2xl shadow-xl p-6 outline-none focus:outline-none">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          {/* Gradient for line & area */}
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#dd6b01" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* optional: keep grid or remove */}
          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

          {/* Hide Axis labels */}
          <XAxis dataKey="name" hide />
          <YAxis
            domain={[0, 100]}
            ticks={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            tickFormatter={(value) => `${value}%`}
          />

          {/* Custom Tooltip */}
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white shadow-md rounded-xl px-3 py-2">
                    <p className="font-semibold text-[#dd6b01]">{label}</p>
                    <p className="text-gray-700">
                      🔥 Marks:{" "}
                      <span className="font-bold">{payload[0].value}</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Average Line */}
          <ReferenceLine
            y={avg}
            label={{
              value: `Avg: ${avg.toFixed(1)}`,
              position: "insideTopRight",
              fill: "#16a34a",
              fontSize: 12,
            }}
            stroke="#16a34a"
            strokeDasharray="5 5"
          />

          {/* Highlight Best & Worst */}
          <ReferenceDot x="Exam 4" y={70} r={8} fill="#22c55e" stroke="none" />
          <ReferenceDot x="Exam 1" y={30} r={8} fill="#ef4444" stroke="none" />

          <Line
            type="monotone"
            dataKey="mark"
            stroke="url(#lineGradient)"
            strokeWidth={3}
            dot={{ r: 6, fill: "#fff", stroke: "#dd6b01", strokeWidth: 2 }}
            activeDot={{ r: 9, stroke: "#f59e0b", strokeWidth: 3 }}
            fillOpacity={1}
            fill="url(#fillGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
