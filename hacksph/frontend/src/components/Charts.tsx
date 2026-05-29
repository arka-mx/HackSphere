"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { casesOverTime, riskPerVillage } from "@/lib/mockData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-4 py-3 text-sm">
        <p className="text-surface-300 font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CasesChart() {
  return (
    <div className="w-full h-80" id="cases-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={casesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHighRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cases"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorCases)"
            name="Total Cases"
          />
          <Area
            type="monotone"
            dataKey="highRisk"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#colorHighRisk)"
            name="High Risk"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskBarChart() {
  return (
    <div className="w-full h-80" id="risk-bar-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={riskPerVillage}
          margin={{ top: 10, right: 10, left: -20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            dataKey="village"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "rgba(148,163,184,0.1)" }}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="risk" name="Risk Score" radius={[6, 6, 0, 0]} barSize={28}>
            {riskPerVillage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
