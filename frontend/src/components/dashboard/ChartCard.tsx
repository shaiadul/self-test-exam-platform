"use client";

import React from "react";
import {
  AreaChart,
  Area,
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
  { name: "Mock 1", value: 45 },
  { name: "Mock 2", value: 65 },
  { name: "Mock 3", value: 55 },
  { name: "Mock 4", value: 82 },
  { name: "Mock 5", value: 74 },
];

export default function ChartCard({
  data = defaultData,
  color = "#dd6b01",
  strokeColor = "#f59e0b",
  avgLabel = "Average Score",
}: ChartCardProps) {
  const chartData = data && data.length > 0 ? data : defaultData;

  // Calculate average value
  const avg =
    chartData.reduce((sum, item) => sum + item.value, 0) / (chartData.length || 1);

  // Find max and min points to highlight
  let maxItem = chartData[0];
  let minItem = chartData[0];
  chartData.forEach((item) => {
    if (item.value > maxItem.value) maxItem = item;
    if (item.value < minItem.value) minItem = item;
  });

  const gradientId = `areaGradient-${color.replace("#", "")}`;

  return (
    <div className="w-full flex flex-col justify-between h-full">
      {/* Chart Canvas */}
      <div className="w-full h-[280px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 15, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="60%" stopColor={strokeColor} stopOpacity={0.08} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#e2e8f0"
              vertical={false}
              opacity={0.7}
            />

            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              dx={-6}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md text-white shadow-xl rounded-2xl p-3.5 border border-slate-800 text-xs min-w-[140px] animate-fadeIn">
                      <p className="font-bold text-slate-300 mb-1.5 text-[11px] uppercase tracking-wider">
                        {label}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">Score:</span>
                        <span className="text-amber-400 font-black text-base">
                          {Number(payload[0].value).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Average Benchmark Line */}
            {avg > 0 && (
              <ReferenceLine
                y={avg}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `${avgLabel}: ${avg.toFixed(0)}%`,
                  position: "insideTopRight",
                  fill: "#059669",
                  fontSize: 11,
                  fontWeight: 700,
                  offset: 8,
                }}
              />
            )}

            {/* High and low markers */}
            {maxItem && chartData.length > 1 && (
              <ReferenceDot
                x={maxItem.name}
                y={maxItem.value}
                r={5.5}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2.5}
              />
            )}
            {minItem && chartData.length > 1 && minItem !== maxItem && (
              <ReferenceDot
                x={minItem.name}
                y={minItem.value}
                r={5.5}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2.5}
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={`url(#${gradientId})`}
              dot={{
                r: 4.5,
                fill: "#ffffff",
                stroke: color,
                strokeWidth: 2.5,
              }}
              activeDot={{
                r: 7,
                fill: color,
                stroke: "#ffffff",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>Score %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" />
            <span>Benchmark Avg ({avg.toFixed(0)}%)</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Peak</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Trough</span>
          </div>
        </div>
      </div>
    </div>
  );
}
