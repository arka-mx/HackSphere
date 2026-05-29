"use client";

import dynamic from "next/dynamic";
import { CasesChart, RiskBarChart } from "@/components/Charts";
import AlertPopup from "@/components/AlertPopup";
import { villages, reports, alerts } from "@/lib/mockData";
import { getRiskBadgeClass, getRiskColor } from "@/utils/helpers";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function DashboardPage() {
  const highRisk = villages.filter((v) => v.riskLevel === "HIGH").length;
  const medRisk = villages.filter((v) => v.riskLevel === "MEDIUM").length;
  const lowRisk = villages.filter((v) => v.riskLevel === "LOW").length;
  const activeAlerts = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="absolute inset-0 bg-radial-glow" />
      <AlertPopup />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text">Surveillance Dashboard</span>
          </h1>
          <p className="text-surface-400">Real-time disease outbreak monitoring and risk visualization</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Reports", value: reports.length, icon: "📋", color: "text-accent-400" },
            { label: "Villages", value: villages.length, icon: "🏘️", color: "text-primary-400" },
            { label: "High Risk", value: highRisk, icon: "🔴", color: "text-danger-400" },
            { label: "Medium Risk", value: medRisk, icon: "🟡", color: "text-warning-400" },
            { label: "Active Alerts", value: activeAlerts, icon: "🚨", color: "text-danger-400" },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-4 stat-card hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <div className="text-xs text-surface-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="glass-card rounded-2xl p-4 mb-8" id="map-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🗺️ Outbreak Risk Map
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ef4444]" /> High</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Medium</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#10b981]" /> Low</span>
            </div>
          </div>
          <div className="h-[500px] rounded-xl overflow-hidden">
            <MapView />
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📈 Cases Over Time
            </h2>
            <CasesChart />
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📊 Risk Score Per Village
            </h2>
            <RiskBarChart />
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="glass-card rounded-2xl p-5" id="reports-table">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📋 Recent Reports
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Village</th>
                  <th className="text-center py-3 px-3 text-surface-400 font-medium">🌡️</th>
                  <th className="text-center py-3 px-3 text-surface-400 font-medium">🤢</th>
                  <th className="text-center py-3 px-3 text-surface-400 font-medium">🤮</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Water</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Date</th>
                  <th className="text-center py-3 px-3 text-surface-400 font-medium">Risk</th>
                  <th className="text-center py-3 px-3 text-surface-400 font-medium">ML</th>
                  <th className="text-center py-3 px-3 text-surface-400 font-medium">Level</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-medium text-white">{r.village}</td>
                    <td className="py-3 px-3 text-center">{r.fever ? "✅" : "❌"}</td>
                    <td className="py-3 px-3 text-center">{r.diarrhea ? "✅" : "❌"}</td>
                    <td className="py-3 px-3 text-center">{r.vomiting ? "✅" : "❌"}</td>
                    <td className="py-3 px-3">
                      <span className={r.waterCondition === "contaminated" ? "text-danger-400" : "text-primary-400"}>
                        {r.waterCondition}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-surface-400">{r.date}</td>
                    <td className="py-3 px-3 text-center font-bold" style={{ color: getRiskColor(r.riskLevel) }}>
                      {r.riskScore}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      {r.mlPrediction ? <span className="text-danger-400 font-bold">⚠️</span> : <span className="text-surface-500">—</span>}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRiskBadgeClass(r.riskLevel)}`}>
                        {r.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
