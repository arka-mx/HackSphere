"use client";

import { useEffect, useState } from "react";
import { submitReport, syncReports } from "@/lib/api";
import { villages } from "@/lib/mockData";
import type { ReportInput, RiskAssessment, WaterCondition } from "@/types/report";
import { calculateRisk, getRiskBadgeClass, toReportInput } from "@/utils/helpers";
import {
  getUnsyncedReports,
  isOnline,
  markAsSynced,
  saveOfflineReport,
} from "@/utils/offlineStorage";

export default function ReportForm() {
  const [village, setVillage] = useState("");
  const [fever, setFever] = useState(0);
  const [diarrhea, setDiarrhea] = useState(0);
  const [vomiting, setVomiting] = useState(0);
  const [waterCondition, setWaterCondition] =
    useState<WaterCondition>("clean");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [online, setOnline] = useState(true);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

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

  const resetForm = () => {
    setVillage("");
    setFever(0);
    setDiarrhea(0);
    setVomiting(0);
    setWaterCondition("clean");
    setDate(new Date().toISOString().split("T")[0]);
    setResult(null);
    setSavedOffline(false);
    setShowSuccess(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!village) return;

    const payload: ReportInput = {
      village,
      fever,
      diarrhea,
      vomiting,
      waterCondition,
      date,
    };

    setSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      let assessment: RiskAssessment;
      let storedOffline = false;

      if (online) {
        const response = await submitReport(payload);
        assessment = response.assessment;
      } else {
        assessment = calculateRisk(
          fever,
          diarrhea,
          vomiting,
          waterCondition === "contaminated"
        );
        saveOfflineReport(payload);
        storedOffline = true;
      }

      setSavedOffline(storedOffline);
      setResult(assessment);
      setShowSuccess(true);
      setUnsyncedCount(getUnsyncedReports().length);
      window.setTimeout(() => setShowSuccess(false), 5000);
    } catch {
      const fallbackAssessment = calculateRisk(
        fever,
        diarrhea,
        vomiting,
        waterCondition === "contaminated"
      );

      saveOfflineReport(payload);
      setSavedOffline(true);
      setResult(fallbackAssessment);
      setShowSuccess(true);
      setUnsyncedCount(getUnsyncedReports().length);
      window.setTimeout(() => setShowSuccess(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async () => {
    const unsyncedReports = getUnsyncedReports();
    if (!online || unsyncedReports.length === 0) return;

    setSyncing(true);

    try {
      await syncReports(unsyncedReports.map((report) => toReportInput(report)));
      markAsSynced(unsyncedReports.map((report) => report.id));
      setUnsyncedCount(getUnsyncedReports().length);
      setSyncSuccess(true);
      window.setTimeout(() => setSyncSuccess(false), 3000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="absolute inset-0 bg-radial-glow" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="gradient-text">Submit Health Report</span>
          </h1>
          <p className="text-surface-400 max-w-lg mx-auto">
            Report village health conditions. If the network drops, reports are
            stored locally and synced later.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              online
                ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                : "bg-warning-500/10 text-warning-400 border border-warning-500/20"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                online ? "bg-primary-500" : "bg-warning-500"
              } animate-pulse`}
            />
            {online ? "Online" : "Offline mode"}
          </div>

          {unsyncedCount > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing || !online}
              className="btn-outline flex items-center gap-2 text-sm !py-2 disabled:opacity-50"
              id="sync-btn"
              type="button"
            >
              {syncing
                ? "Syncing..."
                : `Sync ${unsyncedCount} report${unsyncedCount > 1 ? "s" : ""}`}
            </button>
          )}
        </div>

        {syncSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm animate-scale-in flex items-center gap-2">
            Offline reports synced successfully.
          </div>
        )}

        {showSuccess && result && (
          <div
            className="mb-8 glass-card rounded-2xl p-6 animate-scale-in"
            id="submission-result"
          >
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Report submitted {savedOffline ? "(saved offline)" : ""}
                </h3>
                <p className="text-sm text-surface-400">
                  Risk assessment completed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-surface-900/50">
                <div
                  className="text-2xl font-bold"
                  style={{
                    color:
                      result.level === "HIGH"
                        ? "#ef4444"
                        : result.level === "MEDIUM"
                        ? "#f59e0b"
                        : "#10b981",
                  }}
                >
                  {result.risk}%
                </div>
                <div className="text-xs text-surface-400 mt-1">Risk score</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-900/50">
                <div
                  className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${getRiskBadgeClass(
                    result.level
                  )}`}
                >
                  {result.level}
                </div>
                <div className="text-xs text-surface-400 mt-1">Risk level</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-surface-900/50">
                <div
                  className={`text-2xl font-bold ${
                    result.mlPrediction
                      ? "text-danger-400"
                      : "text-primary-400"
                  }`}
                >
                  {result.mlPrediction ? "YES" : "NO"}
                </div>
                <div className="text-xs text-surface-400 mt-1">
                  ML outbreak
                </div>
              </div>
            </div>

            {result.level === "HIGH" && (
              <div className="mt-4 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-sm text-danger-400">
                High risk detected. Health officers should review this village.
              </div>
            )}

            <button
              onClick={resetForm}
              className="btn-outline mt-4 w-full text-sm"
              id="submit-another-btn"
              type="button"
            >
              Submit another report
            </button>
          </div>
        )}

        {!showSuccess && (
          <form
            onSubmit={handleSubmit}
            className="glass-card rounded-2xl p-6 sm:p-8 space-y-6"
            id="report-form"
          >
            <div>
              <label className="block text-sm font-semibold text-surface-300 mb-2">
                Village
              </label>
              <select
                value={village}
                onChange={(event) => setVillage(event.target.value)}
                className="input-field"
                required
                id="input-village"
              >
                <option value="">Select Village</option>
                {villages.map((currentVillage) => (
                  <option key={currentVillage.name} value={currentVillage.name}>
                    {currentVillage.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-300 mb-3">
                Symptoms Reported
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Fever",
                    value: fever,
                    setter: setFever,
                    id: "input-fever",
                  },
                  {
                    label: "Diarrhea",
                    value: diarrhea,
                    setter: setDiarrhea,
                    id: "input-diarrhea",
                  },
                  {
                    label: "Vomiting",
                    value: vomiting,
                    setter: setVomiting,
                    id: "input-vomiting",
                  },
                ].map((symptom) => (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() =>
                      symptom.setter(symptom.value === 1 ? 0 : 1)
                    }
                    id={symptom.id}
                    className={`p-4 rounded-xl border text-center transition-all duration-300 ${
                      symptom.value
                        ? "bg-danger-500/15 border-danger-500/30 text-danger-400"
                        : "bg-surface-900/50 border-surface-700/30 text-surface-400 hover:border-surface-600/50"
                    }`}
                  >
                    <div className="text-xs font-semibold">{symptom.label}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {symptom.value ? "Yes" : "No"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-300 mb-2">
                Water Condition
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "clean", label: "Clean", description: "Safe water" },
                  {
                    value: "contaminated",
                    label: "Contaminated",
                    description: "Unsafe or dirty water",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setWaterCondition(option.value as WaterCondition)
                    }
                    className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                      waterCondition === option.value
                        ? option.value === "contaminated"
                          ? "bg-danger-500/15 border-danger-500/30"
                          : "bg-primary-500/15 border-primary-500/30"
                        : "bg-surface-900/50 border-surface-700/30 hover:border-surface-600/50"
                    }`}
                    id={`water-${option.value}`}
                  >
                    <div className="text-sm font-semibold text-white">
                      {option.label}
                    </div>
                    <div className="text-xs text-surface-400">
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="input-field"
                required
                id="input-date"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !village}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              id="submit-report-btn"
            >
              {submitting ? "Processing..." : "Submit Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
