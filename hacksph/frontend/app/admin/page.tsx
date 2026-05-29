"use client";

import { useState } from "react";
import { useRole } from "@/lib/RoleContext";
import { getRiskBadgeClass, getRiskColor } from "@/utils/helpers";
import AlertPopup from "@/components/AlertPopup";

type TabType = "symptoms" | "industrial" | "clinical" | "complaints";

export default function AdminPage() {
  const {
    activeRole,
    setActiveRole,
    symptomReports,
    industrialLogs,
    clinicalRecords,
    publicComplaints,
    alerts,
    resolveAlert,
    addAlert,
    villagesList,
  } = useRole();

  const [activeTab, setActiveTab] = useState<TabType>("symptoms");
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // High-level statistics derived from live context
  const totalReports = symptomReports.length;
  const highRiskVillages = villagesList.filter((v) => v.riskLevel === "HIGH");
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");
  const avgRisk = villagesList.length
    ? Math.round(villagesList.reduce((sum, v) => sum + v.riskScore, 0) / villagesList.length)
    : 0;

  // AI Correlation Engine Scans: Checks for overlapped chemical TDS dumps and clinical case counts
  const correlatedOutbreaks = villagesList.map((village) => {
    const industrialRecords = industrialLogs.filter((log) => log.village === village.name && log.effluentLevel === "high");
    const clinicalRecordsForVillage = clinicalRecords.filter((rec) => rec.village === village.name && rec.choleraCases > 5);

    const hasIndustrialHazard = industrialRecords.length > 0;
    const hasClinicalSpike = clinicalRecordsForVillage.length > 0;

    const highestTds = industrialRecords.reduce((max, log) => Math.max(max, log.tds), 0);
    const totalCholera = clinicalRecordsForVillage.reduce((sum, rec) => sum + rec.choleraCases, 0);

    let threatLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    let score = 0;
    let desc = "";

    if (hasIndustrialHazard && hasClinicalSpike) {
      threatLevel = "HIGH";
      score = 94;
      desc = `Critical toxicity correlation! ASHA reported chemical effluent discharge (TDS ${highestTds || 950}ppm) overlapping with ${totalCholera} clinic cholera cases. Outbreak highly imminent.`;
    } else if (hasIndustrialHazard) {
      threatLevel = "MEDIUM";
      score = 65;
      desc = `Pre-epidemic caution. Industrial waste discharge logged (TDS ${highestTds || 600}ppm) near sources. Sickness symptom threshold rising.`;
    } else if (hasClinicalSpike) {
      threatLevel = "MEDIUM";
      score = 55;
      desc = `Clinical surge. ${totalCholera} acute cases filed by medical clinic. Water analysis scheduled.`;
    }

    return {
      village: village.name,
      score,
      threatLevel,
      desc,
      active: score > 0,
      tds: highestTds,
      cases: totalCholera,
    };
  }).filter((c) => c.active).sort((a, b) => b.score - a.score);

  const handleDispatchSquad = (villageName: string, reason: string) => {
    // Check if an alert already exists for this village
    const alertExists = activeAlerts.find((a) => a.village === villageName);
    if (!alertExists) {
      addAlert({
        id: Date.now(),
        village: villageName,
        risk: 95,
        timestamp: new Date().toISOString(),
        status: "active",
      });
    }

    setDispatchSuccess(`Emergency medical team and water sanitization squad dispatched to ${villageName}! Reason: ${reason}`);
    window.setTimeout(() => setDispatchSuccess(null), 5000);
  };

  // Guard: if user is not admin, show access notification
  if (activeRole !== "admin") {
    return (
      <div className="min-h-screen bg-grid relative flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative z-10 glass-card rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-danger-500/10 text-danger-400 text-3xl flex items-center justify-center mx-auto animate-pulse">
            🔒
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Officer Access Restricted</h2>
            <p className="text-xs text-surface-400 leading-relaxed">
              You are currently viewing as <span className="font-bold text-primary-400 capitalize">{activeRole}</span>. The Admin Command room is reserved for official state health administrators.
            </p>
          </div>
          <div className="bg-surface-950/50 p-4 rounded-xl text-left border border-white/5 text-[11px] text-surface-400">
            <span className="font-semibold text-white block mb-1">How to test Admin View:</span>
            Use the global **Role Selector HUD** at the bottom of the screen to switch to **Health Admin** mode!
          </div>
          <button
            onClick={() => setActiveRole("admin")}
            className="btn-primary w-full text-xs font-bold py-3"
          >
            👑 Elevate Role to Health Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="absolute inset-0 bg-radial-glow" />
      <AlertPopup />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="gradient-text">Command Center Control Room</span>
            </h1>
            <p className="text-surface-400 text-xs sm:text-sm">
              Integrated real-time epidemiological metrics, ASHA field toxicity feeds, and clinical metrics.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-light text-xs">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-surface-300">Live Server Connected</span>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Field Reports", value: totalReports, icon: "📋", color: "from-blue-500/20 to-cyan-500/20", textColor: "text-accent-400" },
            { label: "High-Risk Districts", value: highRiskVillages.length, icon: "🔴", color: "from-red-500/20 to-rose-500/20", textColor: "text-danger-400" },
            { label: "Active Regional Alerts", value: activeAlerts.length, icon: "🚨", color: "from-orange-500/20 to-amber-500/20", textColor: "text-warning-400" },
            { label: "Avg Risk Index", value: `${avgRisk}%`, icon: "📊", color: "from-emerald-500/20 to-green-500/20", textColor: "text-primary-400" },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 stat-card hover:scale-105 transition-transform duration-300">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl mb-3`}>
                {s.icon}
              </div>
              <div className={`text-2xl font-black ${s.textColor}`}>{s.value}</div>
              <div className="text-xs text-surface-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Dispatch squad success popup banner */}
        {dispatchSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs animate-scale-in flex items-center gap-2">
            🚨 <span className="font-semibold text-white">{dispatchSuccess}</span>
          </div>
        )}

        {/* AI Correlation Predictor Panel */}
        <div className="glass-card rounded-2xl p-6 mb-8 border border-danger-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-danger-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🧠</span>
            <div>
              <h2 className="text-base font-extrabold text-white">AI-Powered Epidemic Correlation Engine</h2>
              <p className="text-[11px] text-surface-400">Cross-referencing ASHA waste observations against medical clinic diagnostic caseloads.</p>
            </div>
          </div>

          <div className="space-y-4">
            {correlatedOutbreaks.length === 0 ? (
              <div className="text-center py-6 text-xs text-surface-500">
                No toxicity-disease correlations detected. Region parameters stable.
              </div>
            ) : (
              correlatedOutbreaks.map((outbreak, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-surface-950/60 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-danger-500/20 transition-all duration-300">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">📍 District {outbreak.village}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        outbreak.threatLevel === "HIGH" ? "bg-danger-500/15 text-danger-400 border border-danger-500/20 animate-pulse" : "bg-warning-500/15 text-warning-400 border border-warning-500/20"
                      }`}>
                        AI Prediction: {outbreak.score}% Outbreak Probability
                      </span>
                    </div>
                    <p className="text-xs text-surface-400 leading-relaxed">{outbreak.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleDispatchSquad(outbreak.village, outbreak.desc)}
                      className="btn-primary text-[10px] !py-2 !px-3 font-bold flex-shrink-0"
                    >
                      🚨 Dispatch Medical Squad
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* High Risk list & Alerts Dispatcher */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Active Alerts with manual controls */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              🚨 Active Regional Alerts
            </h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-surface-500">
                  No active outbreak alerts logged.
                </div>
              ) : (
                activeAlerts.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-surface-900/50 border border-danger-500/10 flex items-center justify-between hover:border-danger-500/25 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger-500" />
                        </span>
                        <span className="font-bold text-white text-sm">{a.village}</span>
                      </div>
                      <p className="text-[10px] text-surface-400">
                        Triggered: {new Date(a.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-black text-danger-400">{a.risk}%</div>
                        <div className="text-[9px] text-surface-500 font-bold uppercase">Risk Score</div>
                      </div>
                      <button
                        onClick={() => {
                          resolveAlert(a.id);
                          alert(`Alert resolved for district ${a.village}! Marked safe in database.`);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold transition-all"
                      >
                        ✓ Resolve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {resolvedAlerts.length > 0 && (
              <div className="pt-4 border-t border-white/5 mt-4">
                <h3 className="text-[10px] text-surface-500 uppercase tracking-widest font-bold mb-2">Recently Resolved (Safe)</h3>
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                  {resolvedAlerts.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-surface-950/40 border border-white/5 flex items-center justify-between opacity-60 text-xs">
                      <span className="text-surface-300 font-semibold">🏘️ {a.village}</span>
                      <span className="text-[10px] text-surface-500">Risk {a.risk}% — Resolved</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* District Risk Indexes */}
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              🏘️ High-Risk Districts Overview
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {highRiskVillages.map((v, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-danger-500/5 border border-danger-500/10 hover:bg-danger-500/10 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-danger-500 block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-danger-500 block absolute inset-0 animate-ping opacity-30" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{v.name} District</div>
                      <div className="text-[10px] text-surface-500">
                        Lat: {v.latitude.toFixed(2)}°N, Lng: {v.longitude.toFixed(2)}°E
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-danger-400">{v.riskScore}%</div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${getRiskBadgeClass(v.riskLevel)}`}>
                      {v.riskLevel}
                    </span>
                  </div>
                </div>
              ))}
              {highRiskVillages.length === 0 && (
                <div className="text-center py-10 text-xs text-surface-500">
                  No districts currently categorized as High Risk. Good job!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-source Data Grids */}
        <div className="glass-card rounded-2xl p-5" id="admin-grids">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              🗄️ Multi-Source Surveillance Grids
            </h2>
            
            {/* Grids Tabs Switcher */}
            <div className="flex flex-wrap gap-1 bg-surface-950 p-1 rounded-xl border border-white/5 text-[10px] font-bold">
              {[
                { type: "symptoms", label: "📋 Household Surveys", count: symptomReports.length },
                { type: "industrial", label: "🏭 Industrial Logs (ASHA)", count: industrialLogs.length },
                { type: "clinical", label: "🏥 Clinical Records (Clinics)", count: clinicalRecords.length },
                { type: "complaints", label: "👥 Public Complaints", count: publicComplaints.length },
              ].map((t) => (
                <button
                  key={t.type}
                  onClick={() => setActiveTab(t.type as TabType)}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    activeTab === t.type
                      ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                      : "text-surface-400 hover:text-white"
                  }`}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {/* TAB 1: SYMPTOMS GRID */}
            {activeTab === "symptoms" && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-left text-surface-400 uppercase tracking-widest font-semibold text-[10px]">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Village</th>
                    <th className="py-3 px-3 text-center">Fever</th>
                    <th className="py-3 px-3 text-center">Diarrhea</th>
                    <th className="py-3 px-3 text-center">Vomiting</th>
                    <th className="py-3 px-3">Water Condition</th>
                    <th className="py-3 px-3 text-center">Risk Score</th>
                    <th className="py-3 px-3 text-center">ML Threat</th>
                    <th className="py-3 px-3">Date Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {symptomReports.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-surface-500 font-mono">#{r.id.toString().slice(-6)}</td>
                      <td className="py-3 px-3 font-semibold text-white">{r.village}</td>
                      <td className="py-3 px-3 text-center text-base">{r.fever ? "🌡️" : "—"}</td>
                      <td className="py-3 px-3 text-center text-base">{r.diarrhea ? "🤢" : "—"}</td>
                      <td className="py-3 px-3 text-center text-base">{r.vomiting ? "🤮" : "—"}</td>
                      <td className="py-3 px-3">
                        <span className={r.waterCondition === "contaminated" ? "text-danger-400 font-bold" : "text-primary-400"}>
                          {r.waterCondition}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold" style={{ color: getRiskColor(r.riskLevel) }}>
                        {r.riskScore}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        {r.mlPrediction ? (
                          <span className="text-danger-400 font-black animate-pulse" title="ML Anomaly Spike">⚠️ anomaly</span>
                        ) : (
                          <span className="text-surface-500">stable</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-surface-400">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TAB 2: INDUSTRIAL TOXICITY GRID */}
            {activeTab === "industrial" && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-left text-surface-400 uppercase tracking-widest font-semibold text-[10px]">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Village</th>
                    <th className="py-3 px-3">Discharge Level</th>
                    <th className="py-3 px-3">Water Appearance</th>
                    <th className="py-3 px-3 text-center">Turbidity</th>
                    <th className="py-3 px-3 text-center">TDS (ppm)</th>
                    <th className="py-3 px-3 text-center">pH Level</th>
                    <th className="py-3 px-3">Suspected Chemicals</th>
                    <th className="py-3 px-3">Filed By</th>
                  </tr>
                </thead>
                <tbody>
                  {industrialLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-surface-500 font-mono">#{log.id.toString().slice(-6)}</td>
                      <td className="py-3 px-3 font-semibold text-white">{log.village}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          log.effluentLevel === "high" ? "bg-danger-500/10 text-danger-400 border border-danger-500/20" : "bg-warning-500/10 text-warning-400 border border-warning-500/20"
                        }`}>
                          {log.effluentLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-surface-300 font-mono text-[11px]">{log.waterColor}</td>
                      <td className="py-3 px-3 text-center font-bold text-surface-300">{log.turbidity} NTU</td>
                      <td className={`py-3 px-3 text-center font-bold ${log.tds > 800 ? "text-danger-400 font-black" : "text-white"}`}>
                        {log.tds} ppm
                      </td>
                      <td className="py-3 px-3 text-center font-semibold" style={{ color: log.ph < 6 || log.ph > 8.5 ? "#ef4444" : "#10b981" }}>
                        {log.ph}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {log.chemicals.map((c, i) => (
                            <span key={i} className="bg-danger-500/10 text-danger-400 text-[10px] px-1.5 py-0.5 rounded font-medium border border-danger-500/15">
                              {c}
                            </span>
                          ))}
                          {log.chemicals.length === 0 && <span className="text-surface-500">—</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-surface-400 font-medium">{log.reportedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TAB 3: CLINICAL CASE LOGS GRID */}
            {activeTab === "clinical" && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-left text-surface-400 uppercase tracking-widest font-semibold text-[10px]">
                    <th className="py-3 px-3">Clinic / Center</th>
                    <th className="py-3 px-3">Area</th>
                    <th className="py-3 px-3 text-center">Cholera</th>
                    <th className="py-3 px-3 text-center">Diarrhea</th>
                    <th className="py-3 px-3 text-center">Typhoid</th>
                    <th className="py-3 px-3 text-center">Malaria</th>
                    <th className="py-3 px-3 text-center">Bed Occupancy</th>
                    <th className="py-3 px-3">Medicine Stock</th>
                    <th className="py-3 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicalRecords.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">{c.clinicName}</td>
                      <td className="py-3 px-3 font-semibold text-surface-400">{c.village}</td>
                      <td className="py-3 px-3 text-center font-bold text-danger-400 text-sm">{c.choleraCases}</td>
                      <td className="py-3 px-3 text-center font-bold text-white">{c.diarrheaCases}</td>
                      <td className="py-3 px-3 text-center font-bold text-warning-400">{c.typhoidCases}</td>
                      <td className="py-3 px-3 text-center font-bold text-surface-300">{c.malariaCases}</td>
                      <td className="py-3 px-3 text-center font-bold">
                        <span className={c.bedOccupancy > 80 ? "text-danger-400 font-extrabold" : "text-white"}>
                          {c.bedOccupancy}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          c.medicineStock === "critical" ? "bg-danger-500/10 text-danger-400 border border-danger-500/20" :
                          c.medicineStock === "low" ? "bg-warning-500/10 text-warning-400 border border-warning-500/20" :
                          "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                        }`}>
                          {c.medicineStock}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-surface-400 font-medium">{c.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TAB 4: CITIZEN PUBLIC COMPLAINTS */}
            {activeTab === "complaints" && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-left text-surface-400 uppercase tracking-widest font-semibold text-[10px]">
                    <th className="py-3 px-3">Complainant</th>
                    <th className="py-3 px-3">Village</th>
                    <th className="py-3 px-3">Date Filed</th>
                    <th className="py-3 px-3">Issue Type</th>
                    <th className="py-3 px-3">Complaint Details</th>
                    <th className="py-3 px-3 text-center">Verification Action</th>
                  </tr>
                </thead>
                <tbody>
                  {publicComplaints.map((comp) => (
                    <tr key={comp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">{comp.complainant}</td>
                      <td className="py-3 px-3 font-semibold text-surface-400">{comp.village}</td>
                      <td className="py-3 px-3 text-surface-400">{comp.date}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase bg-surface-900 border ${
                          comp.issueType === "sickness" ? "text-danger-400 border-danger-500/20" :
                          comp.issueType === "color" ? "text-warning-400 border-warning-500/20" :
                          "text-accent-400 border-accent-500/20"
                        }`}>
                          {comp.issueType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-surface-300 max-w-xs truncate" title={comp.details}>
                        {comp.details}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleDispatchSquad(comp.village, `Citizen verified issue: ${comp.details.slice(0, 40)}...`)}
                          className="px-2 py-1 bg-surface-900 border border-white/5 text-[9px] font-bold text-white hover:bg-white/5 rounded transition-all"
                        >
                          Verify & Dispatch Squad
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
