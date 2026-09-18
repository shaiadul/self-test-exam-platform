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
  color = "#f97a00",
  strokeColor = "#f97a00",
  avgLabel = "Average Score",
}: ChartCardProps) {
  const chartData = data && data.length > 0 ? data : defaultData;

  // Resolve CSS variables or fall back to primary orange (#f97a00)
  const resolvedColor =
    !color || color.includes("var(--color-primary") || color === "primary"
      ? "#f97a00"
      : color;
  const resolvedStroke =
    !strokeColor || strokeColor.includes("var(--color-primary") || strokeColor === "primary"
      ? resolvedColor
      : strokeColor;

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

  // Generate safe alphanumeric ID so url(#id) never breaks SVG/CSS syntax
  const safeId = resolvedColor.replace(/[^a-zA-Z0-9]/g, "");
  const gradientId = `areaGradient-${safeId || "f97a00"}`;

  const lastItem = chartData[chartData.length - 1];
  const lastScore = lastItem ? lastItem.value : 0;
  const deltaVsAvg = lastScore - avg;

  return (
    <div className="w-full flex flex-col justify-between h-full">
      {/* Vibe Coding HUD Telemetry Bar */}
      <div className="grid grid-cols-3 gap-2 pb-3 mb-2 border-b border-slate-100">
        <div className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Latest</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-base sm:text-lg font-mono font-black text-slate-900 mt-0.5">
            {lastScore.toFixed(1)}%
          </p>
        </div>

        <div className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Average</span>
          <p className="text-base sm:text-lg font-mono font-black text-slate-700 mt-0.5">
            {avg.toFixed(1)}%
          </p>
        </div>

        <div className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200/60">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Peak Mark</span>
          <p className="text-base sm:text-lg font-mono font-black text-emerald-600 mt-0.5">
            {maxItem?.value?.toFixed(1) || "0.0"}%
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-[220px] sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={resolvedColor} stopOpacity={0.25} />
                <stop offset="50%" stopColor={resolvedColor} stopOpacity={0.12} />
                <stop offset="90%" stopColor={resolvedColor} stopOpacity={0.03} />
                <stop offset="100%" stopColor={resolvedColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 2"
              stroke="#e2e8f0"
              vertical={false}
              opacity={0.8}
            />

            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              stroke="#94a3b8"
              fontSize={10}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              dx={-6}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = Number(payload[0].value);
                  const diff = val - avg;
                  return (
                    <div className="bg-slate-950/95 backdrop-blur-md text-white shadow-2xl rounded p-2.5 border border-slate-800 text-xs min-w-[140px] font-mono animate-fadeIn">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1.5">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{label}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-slate-400 text-[11px]">Score:</span>
                        <span className="text-white font-black text-sm">{val.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>vs Avg:</span>
                        <span className={diff >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`}
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
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `${avgLabel}: ${avg.toFixed(0)}%`,
                  position: "insideTopRight",
                  fill: "#059669",
                  fontSize: 10,
                  fontWeight: 700,
                  offset: 6,
                }}
              />
            )}

            {/* High and low markers */}
            {maxItem && chartData.length > 1 && (
              <ReferenceDot
                x={maxItem.name}
                y={maxItem.value}
                r={4.5}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}
            {minItem && chartData.length > 1 && minItem !== maxItem && (
              <ReferenceDot
                x={minItem.name}
                y={minItem.value}
                r={4.5}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke={resolvedStroke}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={{
                r: 3.5,
                fill: "#ffffff",
                stroke: resolvedStroke,
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5.5,
                fill: resolvedStroke,
                stroke: "#ffffff",
                strokeWidth: 2.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs font-semibold text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: resolvedColor }}
            />
            <span className="text-[11px]">Score Trajectory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t-2 border-dashed border-emerald-500" />
            <span className="text-[11px]">Avg Target ({avg.toFixed(0)}%)</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Peak ({maxItem?.value || 0}%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Trough ({minItem?.value || 0}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
