"use client";
import type { HoldingWithValue } from "@/lib/types";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";

interface Props {
  holdings: HoldingWithValue[];
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#ec4899",
  "#6366f1",
];

function CustomLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (!percent || percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const ri = Number(innerRadius);
  const ro = Number(outerRadius);
  const radius = ri + (ro - ri) * 0.5;
  const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function AllocationChart({ holdings }: Props) {
  if (holdings.length < 2) return null;

  const totalValue = holdings.reduce(
    (s, h) => s + (h.currentValue ?? h.costBasis),
    0,
  );
  if (totalValue <= 0) return null;

  const data = holdings.map((h) => ({
    name: h.symbol,
    value: h.currentValue ?? h.costBasis,
    pnlPercent: h.pnlPercent,
  }));

  return (
    <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-900 light:bg-gray-50 border border-zinc-800 dark:border-zinc-800 light:border-gray-200 p-4 mb-5">
      <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
        Allocation
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((_, idx) => (
              <Cell
                key={idx}
                fill={COLORS[idx % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => {
              const num = typeof value === "number" ? value : Number(value);
              return [
                `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                "Value",
              ] as [string, string];
            }}
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#a1a1aa" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: string, entry: any) => {
              const val = entry?.payload?.value;
              const pct =
                typeof val === "number"
                  ? ((val / totalValue) * 100).toFixed(1)
                  : "0.0";
              return (
                <span style={{ color: "#a1a1aa", fontSize: 11 }}>
                  {value} {pct}%
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
