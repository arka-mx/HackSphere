"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRole } from "@/lib/RoleContext";
import { CasesChart, RiskBarChart } from "@/components/Charts";
import AlertPopup from "@/components/AlertPopup";
import { getRiskBadgeClass, getRiskColor } from "@/utils/helpers";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function DashboardPage() {
  const {
    symptomReports,
    industrialLogs,
    clinicalRecords,
    alerts,
    villagesList,
  } = useRole();

  const [selectedVillage, setSelectedVillage] = useState("");
  const [copiedSafetyMsg, setCopiedSafetyMsg] = useState(false);

  // Default to first village if none selected
  useEffect(() => {
    if (villagesList.length > 0 && !selectedVillage) {
      setSelectedVillage(villagesList[0].name);
    }
  }, [villagesList, selectedVillage]);

  // Derived statistics from live context
  const highRisk = villagesList.filter((v) => v.riskLevel === "HIGH").length;
  const medRisk = villagesList.filter((v) => v.riskLevel === "MEDIUM").length;
  const lowRisk = villagesList.filter((v) => v.riskLevel === "LOW").length;
  const activeAlertsCount = alerts.filter((a) => a.status === "active").length;

  // Selected Village Health Metrics
  const currentVillageObj = villagesList.find((v) => v.name === selectedVillage);
  const villageSymptoms = symptomReports.filter((r) => r.village === selectedVillage);
  const villageIndustrial = industrialLogs.filter((log) => log.village === selectedVillage);
  const villageClinical = clinicalRecords.filter((rec) => rec.village === selectedVillage);

  // Compute a letter Grade based on Risk Score
  const getVillageGrade = (score: number) => {
    if (score >= 80) return { grade: "F", text: "Hazardous / Outbreak Alert", color: "text-danger-400 border-danger-500/30 bg-danger-500/10" };
    if (score >= 60) return { grade: "D", text: "Critical Contamination Warning", color: "text-danger-300 border-danger-400/20 bg-danger-400/5" };
    if (score >= 40) return { grade: "C", text: "Moderate Environmental Risk", color: "text-warning-400 border-warning-500/30 bg-warning-500/10" };
    if (score >= 20) return { grade: "B", text: "Mild Alert / Under Surveillance", color: "text-primary-300 border-primary-500/10 bg-primary-500/5" };
    return { grade: "A", text: "Safe Water Parameters", color: "text-primary-400 border-primary-500/30 bg-primary-500/10" };
  };

  const currentGrade = currentVillageObj ? getVillageGrade(currentVillageObj.riskScore) : { grade: "A", text: "Safe Parameters", color: "text-primary-400 border-primary-500/20 bg-primary-500/10" };

  // Collect active observations for selected village
  const activeObservations: string[] = [];
  let advisoryAdvice = "";

  if (currentVillageObj) {
    const activeFever = villageSymptoms.some((r) => r.fever > 0);
    const activeDiarrhea = villageSymptoms.some((r) => r.diarrhea > 0);
    const activeContaminated = villageSymptoms.some((r) => r.waterCondition === "contaminated");

    const highTdsLog = villageIndustrial.find((log) => log.tds > 750);
    const chemLogs = Array.from(new Set(villageIndustrial.flatMap((log) => log.chemicals)));
    const totalCholeraCases = villageClinical.reduce((sum, rec) => sum + rec.choleraCases, 0);

    if (highTdsLog) {
      activeObservations.push(`ASHA reported Chemical Toxicity Leak: High TDS (${highTdsLog.tds} ppm), pH (${highTdsLog.ph})`);
    }
    if (chemLogs.length > 0) {
      activeObservations.push(`Suspected Contaminants: ${chemLogs.join(", ")}`);
    }
    if (totalCholeraCases > 0) {
      activeObservations.push(`Confirmed Clinic Admissions: ${totalCholeraCases} cholera cases logged`);
    }
    if (activeContaminated) {
      activeObservations.push(`Water source flagged contaminated by field worker`);
    }
    if (activeDiarrhea || activeFever) {
      activeObservations.push(`Household symptom clusters reported in past 48h`);
    }

    // Set advisory advice
    if (currentVillageObj.riskScore >= 80) {
      advisoryAdvice = "🚨 EMERGENCY WARNING: Severe waterborne hazard active! DO NOT drink tubewell or tap water without boiling vigorously for at least 5 minutes. Distributing emergency chlorine tablets. Avoid nearby factory-side water canals entirely.";
    } else if (currentVillageObj.riskScore >= 50) {
      advisoryAdvice = "⚠️ CONTAMINATION ADVISORY: Mild environmental run-offs detected. Filter water using institutional sand-and-charcoal systems. If using public wells, boil for at least 2 minutes. Watch children for stomach irritation.";
    } else {
      advisoryAdvice = "✓ SAFE CONDITIONS: Water parameters reside inside stable boundaries. Practice standard hygiene: wash hands with soap for 20 seconds before food prep, and keep storage containers sealed.";
    }
  }

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="absolute inset-0 bg-radial-glow" />
      <AlertPopup />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text">Surveillance & Safety Dashboard</span>
          </h1>
          <p className="text-surface-400 text-xs sm:text-sm">
            Live epidemic maps, industrial TDS logs, and tailored community wellness indices.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Logged Field Reports", value: symptomReports.length, icon: "📋", color: "text-accent-400" },
            { label: "Surviving Districts", value: villagesList.length, icon: "🏘️", color: "text-primary-400" },
            { label: "High Risk Alerts", value: highRisk, icon: "🔴", color: "text-danger-400" },
            { label: "Medium Warning Areas", value: medRisk, icon: "🟡", color: "text-warning-400" },
            { label: "Active Regional Warnings", value: activeAlertsCount, icon: "🚨", color: "text-danger-400 font-extrabold" },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-xl p-4 stat-card hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl sm:text-2xl">{s.icon}</span>
                <span className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</span>
              </div>
              <div className="text-[10px] sm:text-xs text-surface-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* PUBLIC CITIZEN SEARCH HUB (Primary Dashboard Feature) */}
        <div className="glass-card rounded-2xl p-6 mb-8 border border-primary-500/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                💧 Citizen Water Safety Search Hub
              </h2>
              <p className="text-[11px] text-surface-400">Select any local district or village to fetch its real-time wellness evaluation grade.</p>
            </div>
            
            <div className="flex gap-2 items-center w-full md:w-auto">
              <span className="text-xs text-surface-400 font-bold uppercase tracking-wider hidden sm:inline">Lookup:</span>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="input-field !py-2 text-xs font-semibold"
              >
                {villagesList.map((v) => (
                  <option key={v.name} value={v.name}>📍 District {v.name}</option>
                ))}
              </select>
            </div>
          </div>

          {currentVillageObj ? (
            <div className="grid md:grid-cols-3 gap-6 animate-scale-in">
              {/* Wellness Score & Grade Dial */}
              <div className="glass-card rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${getRiskColor(currentVillageObj.riskLevel)} opacity-5 blur-xl pointer-events-none`} />
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black border-2 ${currentGrade.color}`}>
                  {currentGrade.grade}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">District Safety Grade: {currentGrade.grade}</h3>
                  <p className="text-[10px] text-surface-400 mt-0.5">{currentGrade.text}</p>
                </div>
                <div className="w-full bg-surface-950 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${currentVillageObj.riskScore}%`,
                      backgroundColor: getRiskColor(currentVillageObj.riskLevel),
                    }}
                  />
                </div>
                <div className="text-xs text-surface-400 font-bold">
                  Surveillance Index: <span style={{ color: getRiskColor(currentVillageObj.riskLevel) }}>{currentVillageObj.riskScore}% Risk</span>
                </div>
              </div>

              {/* Live Environmental observations */}
              <div className="glass-card rounded-xl p-5 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Toxicity & Case Indicators</h4>
                
                {activeObservations.length === 0 ? (
                  <div className="text-xs text-surface-500 flex items-center justify-center h-[120px]">
                    No contaminants or sickness clusters recorded. Parameters clear.
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {activeObservations.map((obs, idx) => (
                      <li key={idx} className="text-xs text-surface-300 flex items-start gap-2 bg-surface-950/30 p-2 rounded border border-white/5">
                        <span className="text-danger-400">⚠</span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Dynamic Advisory Advice checklist */}
              <div className="glass-card rounded-xl p-5 border border-white/5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Citizen Health Directive</h4>
                  <p className="text-xs text-surface-300 leading-relaxed bg-surface-950/40 p-3 rounded-lg border border-white/5 font-medium">
                    {advisoryAdvice}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`JalRakshak Advisory for ${selectedVillage}: ${advisoryAdvice}`);
                    setCopiedSafetyMsg(true);
                    window.setTimeout(() => setCopiedSafetyMsg(false), 2000);
                  }}
                  className="btn-outline !py-2 text-[10px] font-bold mt-3 w-full text-center"
                >
                  {copiedSafetyMsg ? "Copied to Clipboard!" : "✉ Share Safety advisory"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-surface-500">
              No village parameters available. Select a location above.
            </div>
          )}
        </div>

        {/* Map */}
        <div className="glass-card rounded-2xl p-4 mb-8" id="map-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              🗺️ Disease Outbreak Risk Heatmap
            </h2>
            <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> High (≥80)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Medium (50-79)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Low (&lt;50)</span>
            </div>
          </div>
          <div className="h-[500px] rounded-xl overflow-hidden">
            <MapView villages={villagesList} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📈 Regional Caseload Outbreak Trends
            </h2>
            <CasesChart />
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              📊 Multi-District Risk Score Comparisons
            </h2>
            <RiskBarChart />
          </div>
        </div>

        {/* Recent Reports Table (dynamic log list) */}
        <div className="glass-card rounded-2xl p-5" id="reports-table">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📋 Live Surveillance Log Feed
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/5 text-surface-400 uppercase tracking-widest font-semibold text-[10px]">
                  <th className="py-3 px-3">Village</th>
                  <th className="py-3 px-3 text-center">Fever</th>
                  <th className="py-3 px-3 text-center">Diarrhea</th>
                  <th className="py-3 px-3 text-center">Vomiting</th>
                  <th className="py-3 px-3">Water Quality</th>
                  <th className="py-3 px-3">Submission Date</th>
                  <th className="py-3 px-3 text-center">Risk Score</th>
                  <th className="py-3 px-3 text-center">AI Prediction</th>
                  <th className="py-3 px-3 text-center">Level</th>
                </tr>
              </thead>
              <tbody>
                {symptomReports.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{r.village}</td>
                    <td className="py-3 px-3 text-center text-sm">{r.fever ? "🌡️" : "—"}</td>
                    <td className="py-3 px-3 text-center text-sm">{r.diarrhea ? "🤢" : "—"}</td>
                    <td className="py-3 px-3 text-center text-sm">{r.vomiting ? "🤮" : "—"}</td>
                    <td className="py-3 px-3">
                      <span className={r.waterCondition === "contaminated" ? "text-danger-400 font-bold" : "text-primary-400 font-bold"}>
                        {r.waterCondition}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-surface-400">{r.date}</td>
                    <td className="py-3 px-3 text-center font-black text-sm" style={{ color: getRiskColor(r.riskLevel) }}>
                      {r.riskScore}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      {r.mlPrediction ? (
                        <span className="text-danger-400 font-extrabold animate-pulse">⚠️ Spike</span>
                      ) : (
                        <span className="text-surface-500 font-medium">Clear</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full ${getRiskBadgeClass(r.riskLevel)}`}>
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
