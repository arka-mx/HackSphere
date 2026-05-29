"use client";

import { useRole, UserRole } from "@/lib/RoleContext";
import { useState } from "react";

const roleCards: { role: UserRole; label: string; icon: string; desc: string; color: string }[] = [
  {
    role: "asha",
    label: "ASHA Worker / Volunteer",
    icon: "👩‍⚕️🏥",
    desc: "Rural health worker & clinical coordinator. Log household symptoms, environmental run-offs, and clinical case logs.",
    color: "border-emerald-200 bg-emerald-50/20 hover:border-emerald-500 hover:shadow-emerald-500/5",
  },
  {
    role: "public",
    label: "Public Citizen",
    icon: "👥",
    desc: "General public user. Access all maps, look up safe/warning districts, and get advisory checklists.",
    color: "border-indigo-200 bg-indigo-50/20 hover:border-indigo-500 hover:shadow-indigo-500/5",
  },
  {
    role: "admin",
    label: "Health Administrator",
    icon: "👑",
    desc: "Command officer. Monitor all districts, run AI outbreak correlation tests, & dispatch sanitization squads.",
    color: "border-danger-200 bg-danger-50/20 hover:border-danger-500 hover:shadow-danger-500/5",
  },
];

export default function OnboardingScreen() {
  const { setOnboardingRole, logout, villagesList } = useRole();
  const [selectedRole, setSelectedRole] = useState<UserRole>("asha");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");

  const handleDistrictToggle = (name: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]
    );
  };

  const handleProceed = () => {
    // Validation
    if ((selectedRole === "asha" || selectedRole === "volunteer") && selectedDistricts.length === 0) {
      alert("Please select at least one district to define your operational scope.");
      return;
    }
    setOnboardingRole(selectedRole, selectedDistricts, customName);
  };

  return (
    <div className="min-h-screen bg-grid relative flex flex-col items-center justify-center p-4 py-12">
      <div className="absolute inset-0 bg-radial-glow" />

      {/* Onboarding Container */}
      <div className="relative z-10 glass-card rounded-3xl p-8 max-w-2xl w-full space-y-8 animate-scale-in">
        {/* Onboarding Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-primary-500 tracking-widest block">Setup Surveillance Profile</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Define Your Scope of Operations</h1>
            <p className="text-xs text-slate-500">
              Configure your operational permissions and monitoring scope to unlock personalized reporting sheets.
            </p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-all px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
          >
            ← Sign Out
          </button>
        </div>

        {/* Profile Name input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Your Official Full Name</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="input-field text-xs"
            placeholder="e.g. Sabita Roy, Dr. S. K. Halder"
          />
        </div>

        {/* Onboarding Role Cards Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Surveillance Role</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {roleCards.map((item) => {
              const active = selectedRole === item.role;
              return (
                <div
                  key={item.role}
                  onClick={() => {
                    setSelectedRole(item.role);
                    if (item.role === "admin" || item.role === "public") {
                      setSelectedDistricts([]); // Clear district restrictions
                    }
                  }}
                  className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${item.color} ${
                    active ? "border-primary-500 shadow-lg scale-102" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-xs font-black text-slate-900">{item.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* DISTRICTS MULTI-SELECT GATES (Only for ASHA / Volunteer) */}
        {(selectedRole === "asha" || selectedRole === "volunteer") && (
          <div className="space-y-3 animate-slide-up">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assign Monitoring Districts (Select Multiple)
              </label>
              <span className="text-[10px] text-primary-500 font-bold bg-primary-50 px-2 py-0.5 rounded">
                {selectedDistricts.length} Selected
              </span>
            </div>
            <p className="text-[10px] text-slate-500 -mt-1">
              You will ONLY be permitted to view stats and submit reports for the assigned districts selected below.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-[160px] overflow-y-auto">
              {villagesList.map((v) => {
                const checked = selectedDistricts.includes(v.name);
                return (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => handleDistrictToggle(v.name)}
                    className={`p-2.5 rounded-lg border text-center transition-all text-[10px] font-bold cursor-pointer ${
                      checked
                        ? "bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PUBLIC / ADMIN INFO BLOCKS */}
        {selectedRole === "public" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed animate-slide-up">
            <span className="font-bold text-slate-800 block mb-1">Public Citizen Access Mode</span>
            You are entering the open-source portal. You will have full viewing access to look up and dynamically toggle all districts on the dashboard map, and access regional guides. Data submissions are restricted.
          </div>
        )}

        {selectedRole === "admin" && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed animate-slide-up">
            <span className="font-bold text-slate-800 block mb-1">Global Health Administrator Mode</span>
            You will have full control room clearance. This unlocks the AI epidemic correlator engine, comparative graphs, 15 ML models performance metrics, public complaint verification triggers, and regional squad dispatch tools across all districts globally.
          </div>
        )}

        {/* Proceed Action Button */}
        <button
          onClick={handleProceed}
          className="btn-primary w-full text-xs font-bold py-3.5"
          id="confirm-onboarding-btn"
        >
          ✓ Set Scope and Launch Dashboard
        </button>
      </div>
    </div>
  );
}
