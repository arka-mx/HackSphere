"use client";

import { useEffect, useState } from "react";
import { useRole } from "@/lib/RoleContext";
import { calculateRisk, getRiskBadgeClass } from "@/utils/helpers";
import type { WaterCondition } from "@/types/report";

export default function ReportForm() {
  const {
    activeRole,
    ashaVillage,
    volunteerVillage,
    volunteerClinic,
    addSymptomReport,
    addIndustrialLog,
    addClinicalRecord,
    addPublicComplaint,
    villagesList,
  } = useRole();

  const [online, setOnline] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active form tab for ASHA worker (health survey vs industrial contamination)
  const [ashaTab, setAshaTab] = useState<"survey" | "industrial">("survey");

  // 1. Standard Health Survey Form State
  const [surveyVillage, setSurveyVillage] = useState("");
  const [fever, setFever] = useState(0);
  const [diarrhea, setDiarrhea] = useState(0);
  const [vomiting, setVomiting] = useState(0);
  const [waterCondition, setWaterCondition] = useState<WaterCondition>("clean");
  const [surveyDate, setSurveyDate] = useState(new Date().toISOString().split("T")[0]);
  const [surveyResult, setSurveyResult] = useState<{ risk: number; level: string; ml: boolean } | null>(null);

  // 2. Industrial Contamination Form State
  const [indVillage, setIndVillage] = useState("");
  const [effluentLevel, setEffluentLevel] = useState<"none" | "mild" | "high">("none");
  const [waterColor, setWaterColor] = useState("Normal / Clear");
  const [turbidity, setTurbidity] = useState(5);
  const [tds, setTds] = useState(250);
  const [ph, setPh] = useState(7.0);
  const [selectedChemicals, setSelectedChemicals] = useState<string[]>([]);
  const chemicalsList = ["Arsenic", "Lead", "Fluoride", "Mercury", "Chromium", "Nitrates", "Iron"];

  // 3. Clinical Case Form State
  const [clinVillage, setClinVillage] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [cholera, setCholera] = useState(0);
  const [diarrheaCases, setDiarrheaCases] = useState(0);
  const [typhoid, setTyphoid] = useState(0);
  const [malaria, setMalaria] = useState(0);
  const [bedOccupancy, setBedOccupancy] = useState(20);
  const [medicineStock, setMedicineStock] = useState<"adequate" | "low" | "critical">("adequate");

  // 4. Public Complaint Form State
  const [pubVillage, setPubVillage] = useState("");
  const [complainant, setComplainant] = useState("");
  const [issueType, setIssueType] = useState<"smell" | "color" | "sickness" | "other">("smell");
  const [complaintDetails, setComplaintDetails] = useState("");

  // Sync online status
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
    if (activeRole === "asha") {
      setSurveyVillage(ashaVillage);
      setIndVillage(ashaVillage);
    } else if (activeRole === "volunteer") {
      setClinVillage(volunteerVillage);
      setClinicName(volunteerClinic);
    }
  }, [activeRole, ashaVillage, volunteerVillage, volunteerClinic]);

  // Handle Symptom Report submission
  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyVillage) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Add report to dynamic context
    addSymptomReport({
      village: surveyVillage,
      fever,
      diarrhea,
      vomiting,
      waterCondition,
      date: surveyDate,
    });

    const assessment = calculateRisk(fever, diarrhea, vomiting, waterCondition === "contaminated");
    setSurveyResult({
      risk: assessment.risk,
      level: assessment.level,
      ml: assessment.mlPrediction === 1,
    });

    setShowSuccess(true);
    setSubmitting(false);
  };

  // Handle Industrial Effluent Log submission
  const handleIndustrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indVillage) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    addIndustrialLog({
      village: indVillage,
      effluentLevel,
      waterColor,
      turbidity: Number(turbidity),
      tds: Number(tds),
      ph: Number(ph),
      chemicals: selectedChemicals,
    });

    setShowSuccess(true);
    setSubmitting(false);
  };

  // Handle Clinical Records submission
  const handleClinicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinVillage) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    addClinicalRecord({
      village: clinVillage,
      clinicName: clinicName || "Local Primary Health Subcenter",
      choleraCases: Number(cholera),
      diarrheaCases: Number(diarrheaCases),
      typhoidCases: Number(typhoid),
      malariaCases: Number(malaria),
      bedOccupancy: Number(bedOccupancy),
      medicineStock,
    });

    setShowSuccess(true);
    setSubmitting(false);
  };

  // Handle Public Complaint submission
  const handlePublicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubVillage) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    addPublicComplaint({
      village: pubVillage,
      complainant: complainant || "Anonymous Citizen",
      issueType,
      details: complaintDetails,
    });

    setShowSuccess(true);
    setSubmitting(false);
  };

  const toggleChemical = (chem: string) => {
    setSelectedChemicals((prev) =>
      prev.includes(chem) ? prev.filter((c) => c !== chem) : [...prev, chem]
    );
  };

  const resetFormState = () => {
    // Reset Survey
    setFever(0);
    setDiarrhea(0);
    setVomiting(0);
    setWaterCondition("clean");
    setSurveyResult(null);

    // Reset Industrial
    setEffluentLevel("none");
    setWaterColor("Normal / Clear");
    setTurbidity(5);
    setTds(250);
    setPh(7.0);
    setSelectedChemicals([]);

    // Reset Clinical
    setCholera(0);
    setDiarrheaCases(0);
    setTyphoid(0);
    setMalaria(0);
    setBedOccupancy(20);
    setMedicineStock("adequate");

    // Reset Public
    setComplainant("");
    setComplaintDetails("");
    setIssueType("smell");

    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="absolute inset-0 bg-radial-glow" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="gradient-text">Surveillance Submission Center</span>
          </h1>
          <p className="text-surface-400 max-w-lg mx-auto text-sm">
            Access secure forms tailored to your active operational scope. Offline caching stores data locally during drops and uploads when active.
          </p>
        </div>

        {/* Online Indicator */}
        <div className="flex justify-between items-center mb-6 animate-slide-up">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              online
                ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                : "bg-warning-500/10 text-warning-400 border border-warning-500/20 animate-pulse"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${online ? "bg-primary-500" : "bg-warning-500"} animate-pulse`} />
            {online ? "Network Stable" : "Offline Storage Queue Mode Active"}
          </div>
          <div className="text-xs text-surface-500">
            Reporting mode: <span className="text-white font-bold capitalize">{activeRole}</span>
          </div>
        </div>

        {/* Success Alert popup */}
        {showSuccess && (
          <div className="glass-card rounded-2xl p-6 border border-primary-500/20 animate-scale-in mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-xl text-primary-400 font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Submission Logged Successfully!</h3>
                <p className="text-xs text-surface-400">
                  {online ? "Data transmitted safely to command center server." : "Queued in offline localStorage database. Will sync when back online."}
                </p>
              </div>
            </div>

            {surveyResult && (
              <div className="grid grid-cols-3 gap-3 my-4 bg-surface-950/40 p-4 rounded-xl border border-white/5">
                <div className="text-center">
                  <div className="text-2xl font-bold text-danger-400">{surveyResult.risk}%</div>
                  <div className="text-[10px] text-surface-400 mt-1">Surveillance Risk</div>
                </div>
                <div className="text-center">
                  <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mt-1 ${getRiskBadgeClass(surveyResult.level)}`}>
                    {surveyResult.level}
                  </div>
                  <div className="text-[10px] text-surface-400 mt-2">Hazard Grade</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-primary-400 mt-1">{surveyResult.ml ? "⚠️ Spiking" : "✓ Normal"}</div>
                  <div className="text-[10px] text-surface-400 mt-2">ML Outbreak Predictor</div>
                </div>
              </div>
            )}

            <button
              onClick={resetFormState}
              className="btn-primary w-full text-xs !py-2.5 mt-2"
              type="button"
            >
              Submit Another Report
            </button>
          </div>
        )}

        {/* Forms Dispatcher based on activeRole */}
        {!showSuccess && (
          <div className="animate-scale-in">
            {/* 👑 ADMIN ROLE DISPLAY */}
            {activeRole === "admin" && (
              <div className="glass-card rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-danger-500/10 text-danger-400 text-3xl flex items-center justify-center mx-auto">
                  🛡️
                </div>
                <h2 className="text-xl font-bold text-white">Health Officer Control Scope</h2>
                <p className="text-sm text-surface-400 max-w-md mx-auto leading-relaxed">
                  Administrators have high-level overview access and do not log daily field reports directly. You can inspect all feeds in the **Control Panel**.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      // Switch to ASHA worker for testing
                      const el = document.getElementById("mobile-menu-btn");
                      window.location.hash = "";
                      alert("Switching to ASHA Worker mode to test submission fields!");
                      const btn = document.querySelector('button[onClick*="asha"]') as HTMLButtonElement;
                      if (btn) btn.click();
                    }}
                    className="btn-primary text-xs"
                  >
                    👩‍⚕️ Switch to ASHA Worker Mode
                  </button>
                  <button
                    onClick={() => {
                      alert("Switching to Clinic mode to test hospital logs!");
                      const btn = document.querySelector('button[onClick*="volunteer"]') as HTMLButtonElement;
                      if (btn) btn.click();
                    }}
                    className="btn-outline text-xs"
                  >
                    🏥 Switch to Volunteer Clinic Mode
                  </button>
                </div>
              </div>
            )}

            {/* 👩‍⚕️ ASHA WORKER PORTAL */}
            {activeRole === "asha" && (
              <div className="space-y-6">
                {/* Form Tabs */}
                <div className="flex gap-2 p-1 glass-light rounded-xl max-w-md mx-auto mb-6">
                  <button
                    onClick={() => setAshaTab("survey")}
                    className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all ${
                      ashaTab === "survey"
                        ? "bg-primary-500 text-white shadow-lg"
                        : "text-surface-400 hover:text-white"
                    }`}
                  >
                    📋 Household Symptom Survey
                  </button>
                  <button
                    onClick={() => setAshaTab("industrial")}
                    className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all ${
                      ashaTab === "industrial"
                        ? "bg-primary-500 text-white shadow-lg"
                        : "text-surface-400 hover:text-white"
                    }`}
                  >
                    🏭 Industrial Effluent / Contamination
                  </button>
                </div>

                {ashaTab === "survey" ? (
                  /* Daily Survey Form */
                  <form onSubmit={handleSurveySubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                    <h3 className="text-lg font-bold text-white mb-2">Daily Village Health Survey</h3>
                    <div>
                      <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Scope Village</label>
                      <select
                        value={surveyVillage}
                        onChange={(e) => setSurveyVillage(e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="">Select Village</option>
                        {villagesList.map((v) => (
                          <option key={v.name} value={v.name}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-3">Symptom Flags (Any reported today?)</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "High Fever", val: fever, set: setFever },
                          { label: "Watery Diarrhea", val: diarrhea, set: setDiarrhea },
                          { label: "Acute Vomiting", val: vomiting, set: setVomiting },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => item.set(item.val === 1 ? 0 : 1)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              item.val
                                ? "bg-danger-500/15 border-danger-500/30 text-danger-400 scale-105 font-bold"
                                : "bg-surface-900/50 border-surface-700/30 text-surface-400 hover:border-surface-600/50"
                            }`}
                          >
                            <div className="text-xs">{item.label}</div>
                            <div className="text-[10px] mt-1 opacity-70">{item.val ? "Active Case" : "Clear"}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Local Water Condition</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { val: "clean", label: "Clear / Clean Sources", desc: "No turbidity or bad odor" },
                          { val: "contaminated", label: "Visible Pollution / Unsafe", desc: "Smelly, high color, or foam" },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setWaterCondition(opt.val as WaterCondition)}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              waterCondition === opt.val
                                ? opt.val === "contaminated"
                                  ? "bg-danger-500/15 border-danger-500/30 border-l-4 border-l-danger-500"
                                  : "bg-primary-500/15 border-primary-500/30 border-l-4 border-l-primary-500"
                                : "bg-surface-900/50 border-surface-700/30 hover:border-surface-600/50"
                            }`}
                          >
                            <div className="text-xs font-bold text-white">{opt.label}</div>
                            <div className="text-[10px] text-surface-400 mt-1">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Survey Date</label>
                      <input
                        type="date"
                        value={surveyDate}
                        onChange={(e) => setSurveyDate(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !surveyVillage}
                      className="btn-primary w-full text-xs font-bold py-3 disabled:opacity-50"
                    >
                      {submitting ? "Analyzing and Storing..." : "Log Survey & Analyze Risks"}
                    </button>
                  </form>
                ) : (
                  /* Industrial Contamination Form */
                  <form onSubmit={handleIndustrialSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="border-b border-white/5 pb-2">
                      <h3 className="text-lg font-bold text-white">Industrial Effluent & Contamination Feed</h3>
                      <p className="text-xs text-surface-400">Log industrial discharges or waste leaks in water bodies.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Target District / Area</label>
                        <select
                          value={indVillage}
                          onChange={(e) => setIndVillage(e.target.value)}
                          className="input-field text-xs"
                          required
                        >
                          <option value="">Select Location</option>
                          {villagesList.map((v) => (
                            <option key={v.name} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Factory Effluent Discharge Level</label>
                        <select
                          value={effluentLevel}
                          onChange={(e) => setEffluentLevel(e.target.value as any)}
                          className="input-field text-xs"
                        >
                          <option value="none">No Visible Discharge</option>
                          <option value="mild">Mild Leak / Coloration</option>
                          <option value="high">High Volume Toxic Slurry / Dark Foam</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Water Color / Appearance</label>
                        <input
                          type="text"
                          value={waterColor}
                          onChange={(e) => setWaterColor(e.target.value)}
                          className="input-field text-xs"
                          placeholder="e.g. Brownish, Foamy, Rust-colored"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">TDS Level (ppm)</label>
                        <input
                          type="number"
                          value={tds}
                          onChange={(e) => setTds(Number(e.target.value))}
                          className="input-field text-xs"
                          min="0"
                          max="3000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Water pH level</label>
                        <input
                          type="number"
                          value={ph}
                          onChange={(e) => setPh(Number(e.target.value))}
                          className="input-field text-xs"
                          step="0.1"
                          min="0"
                          max="14"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-3">Suspected Chemical Pollutants</label>
                      <div className="flex flex-wrap gap-2">
                        {chemicalsList.map((chem) => {
                          const selected = selectedChemicals.includes(chem);
                          return (
                            <button
                              key={chem}
                              type="button"
                              onClick={() => toggleChemical(chem)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                selected
                                  ? "bg-danger-500/10 border-danger-500/40 text-danger-400 font-bold"
                                  : "bg-surface-900/40 border-white/5 text-surface-400 hover:border-white/10"
                              }`}
                            >
                              {selected ? "⚠ " : ""}{chem}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !indVillage}
                      className="btn-primary w-full text-xs font-bold py-3 disabled:opacity-50"
                    >
                      {submitting ? "Filing Toxicity Logs..." : "File Industrial Contamination Log"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 🏥 VOLUNTEER & CLINIC LOGS FORM */}
            {activeRole === "volunteer" && (
              <form onSubmit={handleClinicalSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    🏥 Clinical Health Records Portal
                  </h3>
                  <p className="text-xs text-surface-400">File patient admissions & diagnostic statistics representing your local health subcenter.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Hospital/Clinic Name</label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="input-field text-xs"
                      placeholder="e.g. Rampurhat Regional Wellness Camp"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Target District / Area</label>
                    <select
                      value={clinVillage}
                      onChange={(e) => setClinVillage(e.target.value)}
                      className="input-field text-xs"
                      required
                    >
                      <option value="">Select Village</option>
                      {villagesList.map((v) => (
                        <option key={v.name} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-surface-950/40 p-4 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Confirmed Disease Admissions (Last 24 hrs)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Cholera (Cases)", val: cholera, set: setCholera },
                      { label: "Diarrhea (Cases)", val: diarrheaCases, set: setDiarrheaCases },
                      { label: "Typhoid (Cases)", val: typhoid, set: setTyphoid },
                      { label: "Malaria (Cases)", val: malaria, set: setMalaria },
                    ].map((item) => (
                      <div key={item.label}>
                        <label className="block text-[10px] text-surface-400 font-semibold mb-1">{item.label}</label>
                        <input
                          type="number"
                          value={item.val}
                          onChange={(e) => item.set(Math.max(0, Number(e.target.value)))}
                          className="input-field text-xs"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Bed Occupancy Rate (%)</label>
                    <input
                      type="range"
                      value={bedOccupancy}
                      onChange={(e) => setBedOccupancy(Number(e.target.value))}
                      className="w-full h-1 bg-surface-900 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-3"
                      min="0"
                      max="100"
                    />
                    <div className="flex justify-between text-[10px] text-surface-400 font-bold mt-1">
                      <span>0% Empty</span>
                      <span className="text-primary-400">{bedOccupancy}% Occupied</span>
                      <span>100% Critical Capacity</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">ORS & Medicine Stock Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: "adequate", label: "Adequate", color: "text-primary-400 border-primary-500/20" },
                        { val: "low", label: "Low", color: "text-warning-400 border-warning-500/20" },
                        { val: "critical", label: "Critical", color: "text-danger-400 border-danger-500/20" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setMedicineStock(item.val as any)}
                          className={`py-2 px-1 text-center rounded-lg text-[10px] font-bold border transition-all ${
                            medicineStock === item.val
                              ? "bg-white/5 font-extrabold border-white/20 scale-105"
                              : "bg-surface-900/30 border-white/5 text-surface-500"
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
                  disabled={submitting || !clinVillage}
                  className="btn-primary w-full text-xs font-bold py-3 disabled:opacity-50"
                >
                  {submitting ? "Syncing clinical logs..." : "Upload Clinical Case Record Sheet"}
                </button>
              </form>
            )}

            {/* 👥 PUBLIC COMPLAINT FORM */}
            {activeRole === "public" && (
              <form onSubmit={handlePublicSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    👥 Citizen Public Health & Water Safety Report
                  </h3>
                  <p className="text-xs text-surface-400">Notice a localized contamination hotspot or waterborne safety threat? Report it instantly to the region health squads.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Your Full Name (Optional)</label>
                    <input
                      type="text"
                      value={complainant}
                      onChange={(e) => setComplainant(e.target.value)}
                      className="input-field text-xs"
                      placeholder="e.g. Subrata Mondal (leave blank for anonymous)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Affected Village / District</label>
                    <select
                      value={pubVillage}
                      onChange={(e) => setPubVillage(e.target.value)}
                      className="input-field text-xs"
                      required
                    >
                      <option value="">Select Village</option>
                      {villagesList.map((v) => (
                        <option key={v.name} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Specific Water Hazard Issue</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value as any)}
                      className="input-field text-xs"
                    >
                      <option value="smell">Bad Taste / Foul Odor from Tap</option>
                      <option value="color">Discolored water (Brownish / Reddish / Turbid)</option>
                      <option value="sickness">Local Sickness (multiple neighbors ill)</option>
                      <option value="other">Other Environmental Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Reporting Date</label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="input-field text-xs"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">Detailed Observation Description</label>
                  <textarea
                    value={complaintDetails}
                    onChange={(e) => setComplaintDetails(e.target.value)}
                    className="input-field text-xs min-h-[100px]"
                    placeholder="Provide specific details (e.g. 'Since yesterday, the well near the central primary school has a strong chemical odor. Five families reported diarrhea in our street.')"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !pubVillage}
                  className="btn-primary w-full text-xs font-bold py-3"
                >
                  {submitting ? "Filing Community Incident..." : "Submit Citizen Safety Report"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
