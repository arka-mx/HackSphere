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
    activeRole,
    userProfile,
    symptomReports,
    industrialLogs,
    clinicalRecords,
    alerts,
    villagesList,
    isRegionVisible,
  } = useRole();

  const [selectedVillage, setSelectedVillage] = useState("");
  const [copiedSafetyMsg, setCopiedSafetyMsg] = useState(false);

  // Filter logs and villages according to the Active Role's Assigned Districts (Task 8: Data Access Control)
  const filteredVillages = villagesList.filter((v) => isRegionVisible(v.name));
  const filteredReports = symptomReports.filter((r) => isRegionVisible(r.village));
  const filteredAlerts = alerts.filter((a) => isRegionVisible(a.village));

  // Default to first filtered village if none selected
  useEffect(() => {
    if (filteredVillages.length > 0) {
      // Keep selection within filtered boundaries
      const stillValid = filteredVillages.some((v) => v.name === selectedVillage);
      if (!stillValid) {
        setSelectedVillage(filteredVillages[0].name);
      }
    }
  }, [filteredVillages, selectedVillage]);

  // Derived statistics from local filtered context
  const highRiskCount = filteredVillages.filter((v) => v.riskLevel === "HIGH").length;
  const medRiskCount = filteredVillages.filter((v) => v.riskLevel === "MEDIUM").length;
  const activeAlertsCount = filteredAlerts.filter((a) => a.status === "active").length;

  // Selected Village Health Metrics
  const currentVillageObj = filteredVillages.find((v) => v.name === selectedVillage);
  const villageSymptoms = filteredReports.filter((r) => r.village === selectedVillage);
  const villageIndustrial = industrialLogs.filter((log) => log.village === selectedVillage);
  const villageClinical = clinicalRecords.filter((rec) => rec.village === selectedVillage);

  // Compute a letter Grade based on Risk Score
  const getVillageGrade = (score: number) => {
    if (score >= 80) return { grade: "F", text: "Hazardous / Outbreak Alert", color: "text-danger-500 border-danger-100 bg-danger-50" };
    if (score >= 60) return { grade: "D", text: "Critical Contamination Warning", color: "text-danger-400 border-danger-100 bg-danger-50/50" };
    if (score >= 40) return { grade: "C", text: "Moderate Environmental Risk", color: "text-warning-600 border-warning-100 bg-warning-50" };
    if (score >= 20) return { grade: "B", text: "Mild Alert / Under Surveillance", color: "text-primary-500 border-primary-100 bg-primary-50/50" };
    return { grade: "A", text: "Safe Water Parameters", color: "text-emerald-600 border-emerald-100 bg-emerald-50" };
  };

  const currentGrade = currentVillageObj ? getVillageGrade(currentVillageObj.riskScore) : { grade: "A", text: "Safe Parameters", color: "text-emerald-650 border-slate-200 bg-slate-50" };

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
      activeObservations.push(`ASHA logged Chemical Toxicity Leak: High TDS (${highTdsLog.tds} ppm), pH (${highTdsLog.ph})`);
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
      activeObservations.push(`Household sickness symptom clusters reported in past 48h`);
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
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Surveillance Overview Hub
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Dynamic outbreak indicators, predictive hazard maps, and regional water advisories.
            </p>
          </div>

          {/* District Scope indicator banner */}
          {(activeRole === "asha" || activeRole === "volunteer") && userProfile && (
            <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-600 flex items-center gap-2">
              <span>🔒 Assigned District Scope:</span>
              <div className="flex flex-wrap gap-1">
                {userProfile.selectedDistricts.map((d) => (
                  <span key={d} className="bg-primary-50 text-primary-500 border border-primary-100 text-[9px] px-1.5 py-0.5 rounded font-bold">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats in NovaBank Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Assigned Reports", value: filteredReports.length, icon: "📋", color: "text-primary-500" },
            { label: "District Scope", value: filteredVillages.length, icon: "🏘️", color: "text-slate-700" },
            { label: "High Risk Districts", value: highRiskCount, icon: "🔴", color: "text-danger-500" },
            { label: "Warning Regions", value: medRiskCount, icon: "🟡", color: "text-warning-600" },
            { label: "Active Alerts", value: activeAlertsCount, icon: "🚨", color: "text-danger-500 font-extrabold" },
          ].map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 stat-card hover:scale-102 border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl sm:text-2xl">{s.icon}</span>
                <span className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CITIZEN LOOKUP SEARCH CARD (NovaBank styling) */}
        <div className="glass-card rounded-2xl p-6 mb-8 border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                💧 Citizen Water Safety Lookup Hub
              </h2>
              <p className="text-[11px] text-slate-500">Task 8 & 9: Dynamic region-based safety lookups. Click a location to fetch advisories.</p>
            </div>
            
            <div className="flex gap-2 items-center w-full md:w-auto">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">District:</span>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="input-field !py-2 text-xs font-bold"
              >
                {filteredVillages.map((v) => (
                  <option key={v.name} value={v.name}>📍 District {v.name}</option>
                ))}
                {filteredVillages.length === 0 && (
                  <option value="">No districts inside your scope</option>
                )}
              </select>
            </div>
          </div>

          {currentVillageObj ? (
            <div className="grid md:grid-cols-3 gap-6 animate-scale-in">
              {/* Wellness Score & Grade Dial */}
              <div className="glass-card rounded-xl p-5 border flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden bg-slate-50/50">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black border-2 shadow-inner ${currentGrade.color}`}>
                  {currentGrade.grade}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">District Safety: Grade {currentGrade.grade}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">{currentGrade.text}</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${currentVillageObj.riskScore}%`,
                      backgroundColor: getRiskColor(currentVillageObj.riskLevel),
                    }}
                  />
                </div>
                <div className="text-xs text-slate-600 font-bold">
                  Surveillance Risk: <span style={{ color: getRiskColor(currentVillageObj.riskLevel) }} className="font-black">{currentVillageObj.riskScore}% Score</span>
                </div>
              </div>

              {/* Live Toxicity & Caseload observations */}
              <div className="glass-card rounded-xl p-5 border space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Toxicity & Caseload Observations</h4>
                
                {activeObservations.length === 0 ? (
                  <div className="text-xs text-slate-400 flex items-center justify-center h-[120px]">
                    No chemical hazards or clinical spikes recorded.
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {activeObservations.map((obs, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-danger-500 font-bold">⚠</span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Advisories Checklist */}
              <div className="glass-card rounded-xl p-5 border flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Surveillance Advisory Directive</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
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
                  {copiedSafetyMsg ? "Advisory Copied!" : "✉ Share Wellness Advisor"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No village parameters inside your assigned scope.
            </div>
          )}
        </div>

        {/* Dynamic Google Map */}
        <div className="glass-card rounded-2xl p-4 mb-8" id="map-section">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              🗺️ Regional Disease Outbreak Risk Heatmap
            </h2>
            <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> High (≥80)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Medium (50-79)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Low (&lt;50)</span>
            </div>
          </div>
          <div className="h-[500px] rounded-xl overflow-hidden shadow-inner border border-slate-200">
            <MapView villages={filteredVillages} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              📈 Regional Caseload Outbreak Trends
            </h2>
            <CasesChart />
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              📊 Multi-District Risk Score Comparisons
            </h2>
            <RiskBarChart />
          </div>
        </div>

        {/* Recent Reports Table */}
        <div className="glass-card rounded-2xl p-5" id="reports-table">
          <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            📋 Live Surveillance Log Feed (District Scoped)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-widest font-bold text-[9px]">
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
                {filteredReports.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-800">{r.village}</td>
                    <td className="py-3 px-3 text-center text-sm">{r.fever ? "🌡️" : "—"}</td>
                    <td className="py-3 px-3 text-center text-sm">{r.diarrhea ? "🤢" : "—"}</td>
                    <td className="py-3 px-3 text-center text-sm">{r.vomiting ? "🤮" : "—"}</td>
                    <td className="py-3 px-3">
                      <span className={r.waterCondition === "contaminated" ? "text-danger-500 font-bold" : "text-primary-500 font-bold"}>
                        {r.waterCondition}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{r.date}</td>
                    <td className="py-3 px-3 text-center font-black text-sm" style={{ color: getRiskColor(r.riskLevel) }}>
                      {r.riskScore}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      {r.mlPrediction ? (
                        <span className="text-danger-500 font-extrabold animate-pulse">⚠️ Spike</span>
                      ) : (
                        <span className="text-slate-400 font-bold">Clear</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-full ${getRiskBadgeClass(r.riskLevel)}`}>
                        {r.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-xs text-slate-400">
                      No surveillance logs found for your assigned scope.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
