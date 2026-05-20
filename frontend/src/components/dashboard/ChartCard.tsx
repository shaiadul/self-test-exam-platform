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

interface ChartCardProps {
  data?: Array<{ name: string; value: number }>;
  color?: string;
  strokeColor?: string;
  avgLabel?: string;
}

const defaultData = [
  { name: "Exam 1", value: 30 },
  { name: "Exam 2", value: 55 },
  { name: "Exam 3", value: 45 },
  { name: "Exam 4", value: 70 },
  { name: "Exam 5", value: 50 },
];

export default function ChartCard({
  data = defaultData,
  color = "#dd6b01",
  strokeColor = "#f59e0b",
  avgLabel = "Avg",
}: ChartCardProps) {
  // Calculate average value
  const avg = data.reduce((sum, item) => sum + item.value, 0) / (data.length || 1);

  // Find max and min points to highlight
  let maxItem = data[0];
  let minItem = data[0];
  data.forEach(item => {
    if (item.value > maxItem.value) maxItem = item;
    if (item.value < minItem.value) minItem = item;
  });

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`lineGradient-${color}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id={`fillGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-8}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 rounded-xl px-3 py-2 text-xs">
                    <p className="font-bold text-gray-800 mb-1">{label}</p>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                      <span className="text-gray-500">Value:</span>
                      <span className="text-gray-900 font-extrabold">{payload[0].value}%</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Average Line */}
          <ReferenceLine
            y={avg}
            stroke="#10b981"
            strokeDasharray="4 4"
            label={{
              value: `${avgLabel}: ${avg.toFixed(0)}%`,
              position: "insideBottomRight",
              fill: "#10b981",
              fontSize: 10,
              fontWeight: "bold",
            }}
          />

          {/* Highlight high and low bounds */}
          {maxItem && (
            <ReferenceDot x={maxItem.name} y={maxItem.value} r={5} fill="#10b981" stroke="#ffffff" strokeWidth={1.5} />
          )}
          {minItem && (
            <ReferenceDot x={minItem.name} y={minItem.value} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={1.5} />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke={`url(#lineGradient-${color})`}
            strokeWidth={3.5}
            dot={{ r: 4.5, fill: "#ffffff", stroke: color, strokeWidth: 2.5 }}
            activeDot={{ r: 7, fill: color, stroke: "#ffffff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
