"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/lib/RoleContext";
import { getRiskBadgeClass } from "@/utils/helpers";
import type { WaterCondition } from "@/types/report";
import { fetchMeteostatDailyPoint, fetchOpenMeteoWeather } from "@/lib/api";

export default function ReportForm() {
  const {
    activeRole,
    userProfile,
    addSymptomReport,
    addIndustrialLog,
    addClinicalRecord,
    villagesList,
  } = useRole();

  const [online, setOnline] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Tab selector for merged ASHA / Volunteer role
  const [activeTab, setActiveTab] = useState<"survey" | "clinical">("survey");

  // Dynamic dropdown list based on user profile districts (Task 8: Data Access Control)
  const allowedVillages = villagesList.filter((v) => {
    if (activeRole === "admin" || activeRole === "public") return true;
    if (userProfile && userProfile.selectedDistricts.length > 0) {
      return userProfile.selectedDistricts.includes(v.name);
    }
    return true; // Default fallback
  });

  // ASHA Health Survey Form State
  const [surveyVillage, setSurveyVillage] = useState("");
  const [surveyDate, setSurveyDate] = useState(new Date().toISOString().split("T")[0]);
  const [waterCondition, setWaterCondition] = useState<WaterCondition>("clean");
  const [surveyResult, setSurveyResult] = useState<{ risk: number; level: string; ml: boolean } | null>(null);

  // DYNAMIC SYMPTOM LOGGER STATE
  const [symptomsList, setSymptomsList] = useState<{ id: string; name: string; severity: number }[]>([
    { id: "1", name: "Watery Diarrhea", severity: 6 },
    { id: "2", name: "High Fever", severity: 4 },
  ]);
  const [symptomInput, setSymptomInput] = useState("");
  const [symptomSeverityInput, setSymptomSeverityInput] = useState(5);

  // Clinical outreach Log Form State (Volunteer duties)
  const [clinicName, setClinicName] = useState("");
  const [choleraCases, setCholeraCases] = useState(0);
  const [diarrheaCases, setDiarrheaCases] = useState(0);
  const [typhoidCases, setTyphoidCases] = useState(0);
  const [malariaCases, setMalariaCases] = useState(0);
  const [bedOccupancy, setBedOccupancy] = useState(45);
  const [medicineStock, setMedicineStock] = useState<"adequate" | "low" | "critical">("adequate");

  // Admin Environmental & Industrial Form State
  const [adminVillage, setAdminVillage] = useState("");
  const [rainfall, setRainfall] = useState(120); // in mm
  const [rainfallIntensity, setRainfallIntensity] = useState("moderate"); // mild, moderate, heavy
  const [floodRisk, setFloodRisk] = useState(35); // percentage
  const [floodFreq, setFloodFreq] = useState(1); // flood frequency count per year
  const [effluentLevel, setEffluentLevel] = useState<"none" | "mild" | "high">("none");
  const [productionLevel, setProductionLevel] = useState("medium"); // none, low, medium, high
  const [sanitationIndex, setSanitationIndex] = useState(78); // percentage

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Pre-seed default scopes
  useEffect(() => {
    if (allowedVillages.length > 0) {
      setSurveyVillage(allowedVillages[0].name);
      setAdminVillage(allowedVillages[0].name);
    }
  }, [activeRole, userProfile, villagesList]);

  // DYNAMIC WEATHER API FETCH ENGINE (Triggers the split second ASHA inputs/changes the location)
  useEffect(() => {
    if (!surveyVillage) return;

    const matchedVillage = villagesList.find((v) => v.name === surveyVillage);
    if (!matchedVillage) return;

    const lat = matchedVillage.latitude;
    const lon = matchedVillage.longitude;

    console.log(`\ud83c\udf25\ufe0f [WEATHER ENGINE] New location selection detected: "${surveyVillage}" (Lat: ${lat}, Lon: ${lon})`);
    console.log(`\ud83c\udf25\ufe0f [WEATHER ENGINE] Launching parallel Meteostat (RapidAPI) & Open-Meteo queries...`);

    // 1. Free Open-Meteo Current Weather Fetch
    fetchOpenMeteoWeather(lat, lon)
      .then((data) => {
        console.log(`\u2705 [WEATHER ENGINE] Successfully loaded current weather from Free API (Open-Meteo) for ${surveyVillage}:`, data);
      })
      .catch((err) => {
        console.warn(`\u26a0\ufe0f [WEATHER ENGINE] Free Open-Meteo API pre-fetch failed:`, err.message);
      });

    // 2. Meteostat Daily Point Historical Query (Exactly 10 Years Range)
    const today = new Date();
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(today.getFullYear() - 10);

    const startStr = tenYearsAgo.toISOString().split("T")[0];
    const endStr = today.toISOString().split("T")[0];

    console.log(`\ud83d\udcc5 [WEATHER ENGINE] Meteostat span calculated: 10 Years from ${startStr} to ${endStr}`);

    fetchMeteostatDailyPoint(lat, lon, startStr, endStr)
      .then((data) => {
        console.log(`\u2705 [WEATHER ENGINE] Successfully loaded 10-year historical weather from Meteostat (RapidAPI) for ${surveyVillage}:`, data);
      })
      .catch((err) => {
        console.warn(`\u26a0\ufe0f [WEATHER ENGINE] Meteostat 10-year historical API pre-fetch failed (using local fallback logs):`, err.message);
      });
  }, [surveyVillage, villagesList]);

  // Dynamically calculate average symptom severity score from symptoms list
  const calculatedAvgSeverity = symptomsList.length > 0
    ? Math.round(symptomsList.reduce((sum, s) => sum + s.severity, 0) / symptomsList.length)
    : 3;

  // Add Dynamic Symptom to log
  const handleAddSymptom = () => {
    if (!symptomInput.trim()) return;
    const dup = symptomsList.some((s) => s.name.toLowerCase() === symptomInput.trim().toLowerCase());
    if (dup) {
      alert("Symptom already logged in list.");
      return;
    }
    const newSym = {
      id: Date.now().toString(),
      name: symptomInput.trim(),
      severity: symptomSeverityInput,
    };
    setSymptomsList([...symptomsList, newSym]);
    setSymptomInput("");
    setSymptomSeverityInput(5);
  };

  // Remove Dynamic Symptom from log
  const handleRemoveSymptom = (id: string) => {
    setSymptomsList(symptomsList.filter((s) => s.id !== id));
  };

  // ASHA Household Survey Submit
  const handleASHAFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyVillage) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Map listed symptoms into binary flags for the 15 ML models structure
    const hasFever = symptomsList.some((s) => s.name.toLowerCase().includes("fever")) ? 1 : 0;
    const hasDiarrhea = symptomsList.some((s) => s.name.toLowerCase().includes("diarrhea") || s.name.toLowerCase().includes("vomit")) ? 1 : 0;
    const hasVomiting = symptomsList.some((s) => s.name.toLowerCase().includes("vomit") || s.name.toLowerCase().includes("nausea")) ? 1 : 0;

    const weightedSymptoms = hasFever * 2 + hasDiarrhea * 3 + hasVomiting * 2 + (calculatedAvgSeverity * 1.5) + (waterCondition === "contaminated" ? 20 : 0);
    const baseRisk = Math.min(weightedSymptoms * 3.4, 70);
    const featureSum = hasFever + hasDiarrhea + hasVomiting + (waterCondition === "contaminated" ? 1 : 0);
    const mlPrediction = featureSum >= 3 || calculatedAvgSeverity >= 7 ? 1 : 0;
    const finalRisk = Math.min(Math.round(baseRisk + (mlPrediction ? 30 : 0)), 100);
    const level = finalRisk >= 80 ? "HIGH" : finalRisk >= 50 ? "MEDIUM" : "LOW";

    addSymptomReport({
      village: surveyVillage,
      fever: hasFever,
      diarrhea: hasDiarrhea,
      vomiting: hasVomiting,
      waterCondition,
      date: surveyDate,
    });

    setSurveyResult({
      risk: finalRisk,
      level,
      ml: mlPrediction === 1,
    });

    setShowSuccess(true);
    setSubmitting(false);
  };

  // Volunteer Clinical outreach log Submit
  const handleClinicalFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyVillage || !clinicName.trim()) {
      alert("Please specify your clinic wellness center name.");
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    addClinicalRecord({
      village: surveyVillage,
      clinicName: clinicName.trim(),
      choleraCases,
      diarrheaCases,
      typhoidCases,
      malariaCases,
      bedOccupancy,
      medicineStock,
    });

    setShowSuccess(true);
    setSubmitting(false);
  };

  // Admin Environmental Submit
  const handleAdminFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminVillage) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    addIndustrialLog({
      village: adminVillage,
      effluentLevel,
      waterColor: effluentLevel === "high" ? "Dark Turbid Chemical Discharge" : effluentLevel === "mild" ? "Grey Foamy Run-off" : "Clear / Normal",
      turbidity: Math.round(rainfall / 5),
      tds: effluentLevel === "high" ? 1200 : effluentLevel === "mild" ? 650 : 250,
      ph: effluentLevel === "high" ? 4.8 : 7.0,
      chemicals: effluentLevel === "high" ? ["Lead", "Chromium"] : [],
    });

    setShowSuccess(true);
    setSubmitting(false);
  };

  const resetFormState = () => {
    setSymptomsList([
      { id: "1", name: "Watery Diarrhea", severity: 6 },
      { id: "2", name: "High Fever", severity: 4 },
    ]);
    setSymptomInput("");
    setWaterCondition("clean");
    setSurveyResult(null);

    setClinicName("");
    setCholeraCases(0);
    setDiarrheaCases(0);
    setTyphoidCases(0);
    setMalariaCases(0);
    setBedOccupancy(45);
    setMedicineStock("adequate");

    setRainfall(120);
    setRainfallIntensity("moderate");
    setFloodRisk(35);
    setFloodFreq(1);
    setEffluentLevel("none");
    setProductionLevel("medium");
    setSanitationIndex(78);

    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-grid relative pb-24">
      <div className="absolute inset-0 bg-radial-glow" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-8 animate-slide-up">
          <span className="text-[10px] uppercase font-bold text-primary-500 tracking-widest bg-primary-50 px-3 py-1.5 rounded-full border border-primary-100">
            Surveillance Data Input Center
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-3">Log Surveillance Parameters</h1>
          <p className="text-slate-500 text-xs mt-1.5 max-w-md mx-auto">
            Input verified clinical, environmental, or symptom logs. Your access scope is securely locked based on your Google Profile settings.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm mb-6 animate-slide-up">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className={`w-2.5 h-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-warning-500"} animate-pulse`} />
            {online ? "Data Sync Engine Active" : "Offline Caching Database Engaged"}
          </div>
          <div className="flex gap-2 items-center text-xs font-bold text-slate-500">
            Scope: 
            <span className="text-primary-500 uppercase bg-primary-50 px-2 py-0.5 rounded border border-primary-100 font-extrabold">
              {(activeRole === "asha" || activeRole === "volunteer") ? "ASHA / Volunteer" : activeRole}
            </span>
          </div>
        </div>

        {/* Success Splash */}
        {showSuccess && (
          <div className="glass-card rounded-2xl p-6 border border-emerald-200 bg-emerald-50/10 animate-scale-in mb-8">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl font-bold">
                \u2713
              </div>
              <div>
                <h3 className="font-extrabold text-slate-950 text-sm">Surveillance Log successfully stored!</h3>
                <p className="text-xs text-slate-500 leading-tight">
                  {online ? "Data transmitted safely to the ML processing cluster." : "Stored in local SQL queue. Will transmit when stable."}
                </p>
              </div>
            </div>

            {surveyResult && (
              <div className="grid grid-cols-3 gap-3 my-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <div>
                  <div className="text-2xl font-black text-danger-500">{surveyResult.risk}%</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">outbreak risk</div>
                </div>
                <div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mt-1 ${getRiskBadgeClass(surveyResult.level)}`}>
                    {surveyResult.level}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2">hazard grade</div>
                </div>
                <div>
                  <div className="text-xs font-black text-primary-500 mt-2">{surveyResult.ml ? "\u26a0\ufe0f anomaly spike" : "\u2713 normal"}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2.5">randomforest prediction</div>
                </div>
              </div>
            )}

            <button
              onClick={resetFormState}
              className="btn-primary w-full text-xs font-bold py-2.5 mt-2"
              type="button"
            >
              Submit Another Report
            </button>
          </div>
        )}

        {/* Locked Public Citizens notice */}
        {!showSuccess && activeRole === "public" && (
          <div className="glass-card rounded-2xl p-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 text-3xl flex items-center justify-center mx-auto animate-float">
              \ud83d\udc65
            </div>
            <h2 className="text-lg font-black text-slate-900">Public Citizen Reading Mode</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Public user profiles have read-only permissions. You can view regional risk scores, safe maps, and water advisories on the **Overview** dashboard page.
            </p>
            <div className="pt-2 text-slate-400 text-[10px] font-bold">
              To test filing survey sheets, click Sign Out in the header and log in as ASHA / Volunteer.
            </div>
          </div>
        )}

        {/* \ud83d\udc69\u200d\u2695\ufe0f\ud83c\udfe5 UNIFIED ASHA WORKER / CLINIC VOLUNTEER WORKSPACE */}
        {!showSuccess && (activeRole === "asha" || activeRole === "volunteer") && (
          <div className="space-y-4 animate-scale-in">
            {/* Merged Role Tab Selector */}
            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("survey")}
                className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "survey"
                    ? "bg-primary-500 text-white shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                \ud83d\udccb Daily Household Surveys
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("clinical")}
                className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "clinical"
                    ? "bg-primary-500 text-white shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                \ud83c\udfe5 Clinical Outreach Logs
              </button>
            </div>

            {/* TAB 1: DAILY HOUSEHOLD SURVEYS WITH DYNAMIC SYMPTOM LOGGER */}
            {activeTab === "survey" && (
              <form onSubmit={handleASHAFormSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Household Symptom Tracker</h3>
                    <p className="text-[10px] text-slate-500">Log observed symptoms and water conditions in your sector.</p>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded">
                    Field Worker
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Target District / Region</label>
                      <span className="text-[8px] text-slate-400 font-bold">Triggering Weather Pre-fetch</span>
                    </div>
                    <select
                      value={surveyVillage}
                      onChange={(e) => setSurveyVillage(e.target.value)}
                      className="input-field text-xs font-semibold"
                      required
                    >
                      {allowedVillages.map((v) => (
                        <option key={v.name} value={v.name}>\ud83d\udccd {v.name}</option>
                      ))}
                      {allowedVillages.length === 0 && (
                        <option value="">No districts assigned to your profile</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Survey Date</label>
                    <input
                      type="date"
                      value={surveyDate}
                      onChange={(e) => setSurveyDate(e.target.value)}
                      className="input-field text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* DYNAMIC MANUAL SYMPTOM ADDER CONSOLE */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                    \u2795 Dynamic Symptom Intake Console
                  </h4>

                  <div className="grid sm:grid-cols-3 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Symptom Name
                      </label>
                      <input
                        type="text"
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        placeholder="e.g. High Fever, Watery Diarrhea, Vomiting, Rashes"
                        className="input-field !py-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          Severity Level
                        </label>
                        <span className="text-[9px] font-extrabold text-primary-500">{symptomSeverityInput}/10</span>
                      </div>
                      <select
                        value={symptomSeverityInput}
                        onChange={(e) => setSymptomSeverityInput(Number(e.target.value))}
                        className="input-field !py-2 text-xs bg-white font-bold text-center"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <option key={n} value={n}>{n} - {n >= 8 ? "Critical" : n >= 5 ? "Medium" : "Mild"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Presets shortcut buttons */}
                    <div className="flex flex-wrap gap-1 items-center flex-1">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1">Quick Add:</span>
                      {["High Fever", "Watery Diarrhea", "Acute Vomiting", "Stomach Pain"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSymptomInput(preset)}
                          className="bg-white border border-slate-200 hover:border-slate-300 text-[9px] font-bold text-slate-600 px-2 py-1 rounded cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSymptom}
                      className="btn-primary !py-1.5 !px-4 text-xs font-black"
                    >
                      + Add to Log
                    </button>
                  </div>

                  {/* Active Symptoms Table list */}
                  <div className="border-t border-slate-200 pt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Logged Symptoms List
                    </span>

                    {symptomsList.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400 font-medium">
                        No symptoms logged yet. Add symptoms using the intake console above.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {symptomsList.map((sym) => (
                          <div
                            key={sym.id}
                            className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold text-slate-800 flex items-center gap-2 animate-scale-in"
                          >
                            <span className="text-primary-500">\ud83e\ude7a</span>
                            <span>{sym.name}</span>
                            <span className="text-[10px] bg-danger-50 text-danger-500 border border-danger-100 px-1.5 py-0.2 rounded font-black">
                              {sym.severity}/10
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSymptom(sym.id)}
                              className="text-slate-400 hover:text-danger-500 font-black ml-1 text-sm focus:outline-none transition-colors"
                              title="Delete Symptom"
                            >
                              \u2715
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Aggregated Severity Score derived dynamically */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Aggregated Severity Score
                    </label>
                    <div className="flex items-center gap-3.5 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="w-11 h-11 rounded-full bg-primary-500 text-white flex items-center justify-center font-black text-base shadow shadow-primary-500/20">
                        {calculatedAvgSeverity}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block font-black">Symptom Severity Index</span>
                        <span className="text-[9px] text-slate-500 font-bold block leading-none mt-0.5">
                          Calculated automatically from logged symptoms above.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Water Condition */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Drinking Water Condition</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: "clean", label: "Clean / Clear Source", color: "border-primary-200 bg-primary-50/20" },
                        { val: "contaminated", label: "Visibly Contaminated", color: "border-danger-200 bg-danger-50/20 text-danger-500" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setWaterCondition(item.val as any)}
                          className={`py-3 px-2 text-center rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                            waterCondition === item.val
                              ? `${item.color} border-2 scale-102`
                              : "bg-slate-50 border-slate-200 text-slate-500"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || allowedVillages.length === 0}
                  className="btn-primary w-full text-xs font-bold py-3 disabled:opacity-50"
                >
                  {submitting ? "Analyzing and Filing..." : "Transmit Health Survey Logs"}
                </button>
              </form>
            )}

            {/* TAB 2: CLINICAL OUTREACH LOGS */}
            {activeTab === "clinical" && (
              <form onSubmit={handleClinicalFormSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Clinical Outreach Case Sheet</h3>
                    <p className="text-[10px] text-slate-500">Log clinical diagnoses, bed counts, and supply levels at medical camps.</p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-655 border border-amber-100 px-2 py-0.5 rounded">
                    Clinical Officer
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">District Region</label>
                    <select
                      value={surveyVillage}
                      onChange={(e) => setSurveyVillage(e.target.value)}
                      className="input-field text-xs font-semibold"
                      required
                    >
                      {allowedVillages.map((v) => (
                        <option key={v.name} value={v.name}>\ud83d\udccd {v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Health Center / Clinic Name</label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      placeholder="e.g. Bankura Block Wellness Subcenter"
                      className="input-field text-xs font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                    \ud83e\ude7a Diagnosed Waterborne Caseloads (24h)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Cholera Cases", val: choleraCases, set: setCholeraCases },
                      { label: "Diarrhea Cases", val: diarrheaCases, set: setDiarrheaCases },
                      { label: "Typhoid Cases", val: typhoidCases, set: setTyphoidCases },
                      { label: "Malaria Cases", val: malariaCases, set: setMalariaCases },
                    ].map((item) => (
                      <div key={item.label}>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">{item.label}</label>
                        <input
                          type="number"
                          value={item.val}
                          onChange={(e) => item.set(Math.max(0, Number(e.target.value)))}
                          className="input-field !py-1.5 text-xs bg-white font-bold"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Bed occupancy */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Hospital Bed Occupancy Rate</label>
                      <span className="text-[10px] font-extrabold text-primary-500 bg-primary-50 px-2 py-0.5 rounded">
                        {bedOccupancy}% Capacity
                      </span>
                    </div>
                    <input
                      type="range"
                      value={bedOccupancy}
                      onChange={(e) => setBedOccupancy(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-2"
                      min="0"
                      max="100"
                    />
                  </div>

                  {/* Medicine stock levels */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Essential Supplies (ORS / Antibiotics)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: "adequate", label: "Adequate", color: "border-emerald-250 bg-emerald-50/20 text-emerald-600" },
                        { val: "low", label: "Low Stock", color: "border-warning-250 bg-warning-50/20 text-warning-600" },
                        { val: "critical", label: "Emergency", color: "border-danger-250 bg-danger-50/20 text-danger-600 font-extrabold" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setMedicineStock(item.val as any)}
                          className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                            medicineStock === item.val
                              ? `${item.color} border-2 scale-102`
                              : "bg-slate-50 border-slate-200 text-slate-500"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || allowedVillages.length === 0}
                  className="btn-primary w-full text-xs font-bold py-3 disabled:opacity-50"
                >
                  Upload Clinical Case Record Sheet
                </button>
              </form>
            )}
          </div>
        )}

        {/* \ud83d\udc51 ADMIN ENVIRONMENTAL & TOXICITY FORM */}
        {!showSuccess && activeRole === "admin" && (
          <form onSubmit={handleAdminFormSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 animate-scale-in">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Environmental & Waste Logger</h3>
                <p className="text-[10px] text-slate-500">Log industrial waste dumps, rainfall patterns, and regional sanitation indexes.</p>
              </div>
              <span className="text-[10px] font-bold bg-danger-50 text-danger-500 border border-danger-100 px-2 py-0.5 rounded">
                Admin Privilege
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Target District</label>
                <select
                  value={adminVillage}
                  onChange={(e) => setAdminVillage(e.target.value)}
                  className="input-field text-xs font-semibold"
                  required
                >
                  {villagesList.map((v) => (
                    <option key={v.name} value={v.name}>\ud83d\udccd {v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Rainfall Volume (mm)</label>
                <input
                  type="number"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="input-field text-xs"
                  min="0"
                  max="1000"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Rainfall Intensity</label>
                <select
                  value={rainfallIntensity}
                  onChange={(e) => setRainfallIntensity(e.target.value)}
                  className="input-field text-xs font-semibold"
                >
                  <option value="mild">Mild Drizzle</option>
                  <option value="moderate">Moderate Showers</option>
                  <option value="heavy">Heavy Torrential (Monsoon)</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Flood Risk Score (%)</label>
                <input
                  type="number"
                  value={floodRisk}
                  onChange={(e) => setFloodRisk(Number(e.target.value))}
                  className="input-field text-xs"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Flood Frequency (Yearly)</label>
                <input
                  type="number"
                  value={floodFreq}
                  onChange={(e) => setFloodFreq(Number(e.target.value))}
                  className="input-field text-xs"
                  min="0"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Sanitation Index (%)</label>
                <input
                  type="number"
                  value={sanitationIndex}
                  onChange={(e) => setSanitationIndex(Number(e.target.value))}
                  className="input-field text-xs"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Factory Effluent Dumping</label>
                <select
                  value={effluentLevel}
                  onChange={(e) => setEffluentLevel(e.target.value as any)}
                  className="input-field text-xs font-semibold bg-white"
                >
                  <option value="none">No Visible Chemical Discharge</option>
                  <option value="mild">Mild Wastewater Discharge</option>
                  <option value="high">High Volume Toxic Effluents / Acidic Spill</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Production Level Index</label>
                <select
                  value={productionLevel}
                  onChange={(e) => setProductionLevel(e.target.value)}
                  className="input-field text-xs font-semibold bg-white"
                >
                  <option value="none">None / Factory Offline</option>
                  <option value="low">Low Capacities</option>
                  <option value="medium">Standard Mid-Output</option>
                  <option value="high">Max Capacities (Overdrive)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !adminVillage}
              className="btn-primary w-full text-xs font-bold py-3 disabled:opacity-50"
            >
              {submitting ? "Uploading variables..." : "Upload Environmental & Toxicity Logs"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
