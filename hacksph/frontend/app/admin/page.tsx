"use client";

import { villages, reports, alerts } from "@/lib/mockData";
import { getRiskBadgeClass, getRiskColor } from "@/utils/helpers";

export default function AdminPage() {
  const totalReports = reports.length;
  const highRiskVillages = villages.filter((v) => v.riskLevel === "HIGH");
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");
  const avgRisk = Math.round(villages.reduce((sum, v) => sum + v.riskScore, 0) / villages.length);

  const recentReports = [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="absolute inset-0 bg-radial-glow" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="gradient-text">Admin Panel</span>
            </h1>
            <p className="text-surface-400">Health Officer Control Center</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-surface-300">Last updated: just now</span>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reports", value: totalReports, icon: "📋", color: "from-blue-500/20 to-cyan-500/20", textColor: "text-accent-400" },
            { label: "High-Risk Villages", value: highRiskVillages.length, icon: "🔴", color: "from-red-500/20 to-rose-500/20", textColor: "text-danger-400" },
            { label: "Active Alerts", value: activeAlerts.length, icon: "🚨", color: "from-orange-500/20 to-amber-500/20", textColor: "text-warning-400" },
            { label: "Avg. Risk Score", value: `${avgRisk}%`, icon: "📊", color: "from-emerald-500/20 to-green-500/20", textColor: "text-primary-400" },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 stat-card hover:scale-105 transition-transform duration-300">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-3`}>
                {s.icon}
              </div>
              <div className={`text-3xl font-bold ${s.textColor}`}>{s.value}</div>
              <div className="text-sm text-surface-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* High-Risk Villages */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🔴 High-Risk Villages
            </h2>
            <div className="space-y-3">
              {highRiskVillages.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-danger-500/5 border border-danger-500/10 hover:bg-danger-500/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="w-3 h-3 rounded-full bg-danger-500 block" />
                      <span className="w-3 h-3 rounded-full bg-danger-500 block absolute inset-0 animate-ping opacity-30" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{v.name}</div>
                      <div className="text-xs text-surface-400">
                        {v.latitude.toFixed(2)}°N, {v.longitude.toFixed(2)}°E
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-danger-400">{v.riskScore}%</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRiskBadgeClass(v.riskLevel)}`}>
                      {v.riskLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              🚨 Active Alerts
            </h2>
            <div className="space-y-3">
              {activeAlerts.map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-surface-900/50 border border-danger-500/10 hover:border-danger-500/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger-500" />
                        </span>
                        <span className="font-semibold text-white text-sm">{a.village}</span>
                      </div>
                      <p className="text-xs text-surface-400">
                        {new Date(a.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-danger-400">{a.risk}%</div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-danger-500/10 text-danger-400 font-medium">
                        {a.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {resolvedAlerts.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <h3 className="text-xs text-surface-500 uppercase tracking-wider mb-2">Resolved</h3>
                  {resolvedAlerts.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-surface-900/30 opacity-60">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-surface-400">{a.village}</span>
                        <span className="text-xs text-surface-500">{a.risk}% — resolved</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📋 Latest Field Reports
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">#</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Village</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Date</th>
                  <th className="text-center py-3 px-3 text-surface-400 font-medium">Symptoms</th>
                  <th className="text-left py-3 px-3 text-surface-400 font-medium">Water</th>
                  <th className="text-center py-3 px-3 text-surface-400 font-medium">Risk</th>
                  <th className="text-center py-3 px-3 text-surface-400 font-medium">Level</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-surface-500">{r.id}</td>
                    <td className="py-3 px-3 font-medium text-white">{r.village}</td>
                    <td className="py-3 px-3 text-surface-400">{r.date}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {r.fever ? <span title="Fever">🌡️</span> : null}
                        {r.diarrhea ? <span title="Diarrhea">🤢</span> : null}
                        {r.vomiting ? <span title="Vomiting">🤮</span> : null}
                        {!r.fever && !r.diarrhea && !r.vomiting && <span className="text-surface-500">—</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={r.waterCondition === "contaminated" ? "text-danger-400" : "text-primary-400"}>
                        {r.waterCondition}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold" style={{ color: getRiskColor(r.riskLevel) }}>
                      {r.riskScore}%
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
