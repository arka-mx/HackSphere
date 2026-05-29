"use client";

import { useState, useEffect } from "react";
import { villages, calculateRisk, getRiskBadgeClass } from "@/lib/mockData";
import {
  saveOfflineReport,
  getUnsyncedReports,
  markAsSynced,
  isOnline,
} from "@/lib/offlineStorage";

interface SubmissionResult {
  risk: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  mlPrediction: number;
}

export default function ReportPage() {
  const [village, setVillage] = useState("");
  const [fever, setFever] = useState(0);
  const [diarrhea, setDiarrhea] = useState(0);
  const [vomiting, setVomiting] = useState(0);
  const [waterCondition, setWaterCondition] = useState("clean");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [online, setOnline] = useState(true);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    setOnline(isOnline());
    setUnsyncedCount(getUnsyncedReports().length);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!village) return;

    setSubmitting(true);

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 1200));

    const riskResult = calculateRisk(
      fever,
      diarrhea,
      vomiting,
      waterCondition === "contaminated"
    );

    if (!online) {
      // Save offline
      saveOfflineReport({
        village,
        fever,
        diarrhea,
        vomiting,
        waterCondition,
        date,
      });
      setUnsyncedCount(getUnsyncedReports().length);
    }

    setResult(riskResult);
    setShowSuccess(true);
    setSubmitting(false);

    // Auto-hide success
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleSync = async () => {
    setSyncing(true);
    const unsynced = getUnsyncedReports();

    // Simulate bulk upload
    await new Promise((r) => setTimeout(r, 2000));

    markAsSynced(unsynced.map((r) => r.id));
    setUnsyncedCount(0);
    setSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  const resetForm = () => {
    setVillage("");
    setFever(0);
    setDiarrhea(0);
    setVomiting(0);
    setWaterCondition("clean");
    setDate(new Date().toISOString().split("T")[0]);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="absolute inset-0 bg-radial-glow" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="gradient-text">Submit Health Report</span>
          </h1>
          <p className="text-surface-400 max-w-lg mx-auto">
            Report health conditions from your village. Works offline — data will sync when connected.
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${online ? "bg-primary-500/10 text-primary-400 border border-primary-500/20" : "bg-warning-500/10 text-warning-400 border border-warning-500/20"}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${online ? "bg-primary-500" : "bg-warning-500"} animate-pulse`} />
            {online ? "Online" : "Offline Mode"}
          </div>

          {unsyncedCount > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing || !online}
              className="btn-outline flex items-center gap-2 text-sm !py-2 disabled:opacity-50"
              id="sync-btn"
            >
              {syncing ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  🔄 Sync {unsyncedCount} Report{unsyncedCount > 1 ? "s" : ""}
                </>
              )}
            </button>
          )}
        </div>

        {/* Sync success */}
        {syncSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm animate-scale-in flex items-center gap-2">
            ✅ All reports synced successfully!
          </div>
        )}

        {/* Success Result */}
        {showSuccess && result && (
          <div className="mb-8 glass-card rounded-2xl p-6 animate-scale-in" id="submission-result">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">
                {result.level === "HIGH" ? "🔴" : result.level === "MEDIUM" ? "🟡" : "🟢"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Report Submitted {!online && "(Saved Offline)"}</h3>
                <p className="text-sm text-surface-400">AI analysis complete</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-surface-900/50">
                <div className="text-2xl font-bold" style={{ color: result.level === "HIGH" ? "#ef4444" : result.level === "MEDIUM" ? "#f59e0b" : "#10b981" }}>
                  {result.risk}%
                </div>
                <div className="text-xs text-surface-400 mt-1">Risk Score</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-900/50">
                <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${getRiskBadgeClass(result.level)}`}>
                  {result.level}
                </div>
                <div className="text-xs text-surface-400 mt-1">Risk Level</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-900/50">
                <div className={`text-2xl font-bold ${result.mlPrediction ? "text-danger-400" : "text-primary-400"}`}>
                  {result.mlPrediction ? "YES" : "NO"}
                </div>
                <div className="text-xs text-surface-400 mt-1">ML Outbreak</div>
              </div>
            </div>

            {result.level === "HIGH" && (
              <div className="mt-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-sm text-danger-400 flex items-center gap-2">
                ⚠️ HIGH RISK DETECTED — Alert has been triggered for health officers
              </div>
            )}

            <button onClick={resetForm} className="btn-outline mt-4 w-full text-sm" id="submit-another-btn">
              Submit Another Report
            </button>
          </div>
        )}

        {/* Form */}
        {!showSuccess && (
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6" id="report-form">
            {/* Village */}
            <div>
              <label className="block text-sm font-semibold text-surface-300 mb-2">🏘️ Village</label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="input-field"
                required
                id="input-village"
              >
                <option value="">Select Village</option>
                {villages.map((v) => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Symptoms Grid */}
            <div>
              <label className="block text-sm font-semibold text-surface-300 mb-3">🩺 Symptoms Reported</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Fever", value: fever, setter: setFever, id: "input-fever", emoji: "🌡️" },
                  { label: "Diarrhea", value: diarrhea, setter: setDiarrhea, id: "input-diarrhea", emoji: "🤢" },
                  { label: "Vomiting", value: vomiting, setter: setVomiting, id: "input-vomiting", emoji: "🤮" },
                ].map((symptom) => (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => symptom.setter(symptom.value === 1 ? 0 : 1)}
                    id={symptom.id}
                    className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                      symptom.value
                        ? "bg-danger-500/15 border-danger-500/30 text-danger-400"
                        : "bg-surface-900/50 border-surface-700/30 text-surface-400 hover:border-surface-600/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{symptom.emoji}</div>
                    <div className="text-xs font-semibold">{symptom.label}</div>
                    <div className="text-xs mt-1 opacity-70">{symptom.value ? "Yes" : "No"}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Water Condition */}
            <div>
              <label className="block text-sm font-semibold text-surface-300 mb-2">💧 Water Condition</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "clean", label: "Clean", emoji: "✅", desc: "Safe to drink" },
                  { val: "contaminated", label: "Contaminated", emoji: "⚠️", desc: "Unsafe / dirty" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setWaterCondition(opt.val)}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                      waterCondition === opt.val
                        ? opt.val === "contaminated"
                          ? "bg-danger-500/15 border-danger-500/30"
                          : "bg-primary-500/15 border-primary-500/30"
                        : "bg-surface-900/50 border-surface-700/30 hover:border-surface-600/50"
                    }`}
                    id={`water-${opt.val}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{opt.emoji}</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{opt.label}</div>
                        <div className="text-xs text-surface-400">{opt.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-surface-300 mb-2">📅 Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
                required
                id="input-date"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !village}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              id="submit-report-btn"
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing with AI...
                </>
              ) : (
                <>
                  🚀 Submit Report {!online && "(Offline)"}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
