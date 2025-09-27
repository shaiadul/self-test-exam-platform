"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Exam 1", mark: 30 },
  { name: "Exam 2", mark: 55 },
  { name: "Exam 3", mark: 45 },
  { name: "Exam 4", mark: 70 },
  { name: "Exam 5", mark: 50 },
];

export default function ChartCard() {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="mark"
            stroke="#dd6b01"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
