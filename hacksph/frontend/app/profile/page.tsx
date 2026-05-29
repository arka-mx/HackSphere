"use client";

import { useState } from "react";
import { useRole } from "@/lib/RoleContext";
import { villages as predefinedVillages } from "@/lib/mockData";
import Link from "next/link";

export default function ProfilePage() {
  const { userProfile, updateUserProfile, activeRole } = useRole();

  const [name, setName] = useState(userProfile?.name || "");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
    userProfile?.selectedDistricts || []
  );
  const [avatarUrl, setAvatarUrl] = useState(
    userProfile?.avatarUrl ||
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-grid relative flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative z-10 glass-card rounded-3xl p-8 max-w-md w-full text-center space-y-4 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-danger-500 text-3xl flex items-center justify-center mx-auto animate-pulse border border-rose-100">
            🔒
          </div>
          <h2 className="text-xl font-black text-slate-900">Session Expired</h2>
          <p className="text-xs text-slate-500">Please sign in again to access profile settings.</p>
          <Link href="/" className="btn-primary w-full text-xs font-bold py-2.5 block text-center mt-4">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleDistrictToggle = (districtName: string) => {
    setSelectedDistricts((prev) =>
      prev.includes(districtName)
        ? prev.filter((d) => d !== districtName)
        : [...prev, districtName]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateUserProfile({
      name,
      selectedDistricts,
      avatarUrl,
    });

    setSuccessMsg("Your profile details have been successfully updated!");
    window.setTimeout(() => setSuccessMsg(null), 4000);
  };

  const isAshaOrVolunteer = activeRole === "asha" || activeRole === "volunteer";

  return (
    <div className="min-h-screen bg-grid relative pb-24">
      <div className="absolute inset-0 bg-radial-glow" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Breadcrumb / Back button */}
        <div className="mb-6 animate-slide-up">
          <Link
            href="/dashboard"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
          >
            ← Back to Dashboard Overview
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage your personal profile details, district scopes, and system credentials.
          </p>
        </div>

        {successMsg && (
          <div className="glass-card rounded-2xl p-4 border border-emerald-200 bg-emerald-50/10 text-emerald-700 text-xs font-bold flex items-center gap-3 animate-scale-in mb-6">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
              ✓
            </span>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 animate-scale-in">
          {/* Card 1: Google Profile Details */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border space-y-6">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Surveillance Credentials</h3>
                <p className="text-[10px] text-slate-500">Google Auth details and role permissions.</p>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded border capitalize leading-none
                  ${
                    activeRole === "admin"
                      ? "bg-danger-50 text-danger-500 border-danger-100"
                      : isAshaOrVolunteer
                      ? "bg-emerald-50 text-emerald-500 border-emerald-100"
                      : "bg-indigo-50 text-indigo-500 border-indigo-100"
                  }`}
              >
                {isAshaOrVolunteer ? "ASHA / Volunteer" : activeRole}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Profile Avatar Selection */}
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-24 h-24 rounded-full object-cover border border-slate-200 shadow-sm"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold pointer-events-none">
                  Google Avatar
                </div>
              </div>

              {/* Identity fields */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Full Name (ASHA Profile)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field text-xs font-bold !py-2.5"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Verified Google Email
                  </label>
                  <input
                    type="email"
                    value={userProfile.email}
                    disabled
                    className="input-field text-xs font-semibold bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed !py-2.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: ASHA Worker Location Scope Settings */}
          {isAshaOrVolunteer && (
            <div className="glass-card rounded-2xl p-6 sm:p-8 border space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  📍 District Scope & Regional Boundaries
                </h3>
                <p className="text-[10px] text-slate-500">
                  Select the regional districts/villages that fall under your surveillance duty. You will receive outbreak alerts and be allowed to submit surveys for these locations only.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {predefinedVillages.map((village) => {
                  const isChecked = selectedDistricts.includes(village.name);
                  return (
                    <button
                      key={village.name}
                      type="button"
                      onClick={() => handleDistrictToggle(village.name)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col justify-between h-20 group hover:scale-102
                        ${
                          isChecked
                            ? "bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/10"
                            : "bg-white border-slate-200 text-slate-700 hover:border-primary-500/40"
                        }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                        District
                      </span>
                      <span className="text-xs truncate max-w-full font-black">
                        📍 {village.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDistricts.length === 0 && (
                <p className="text-[10px] text-danger-500 font-extrabold bg-danger-50 p-3 rounded-lg border border-danger-100">
                  ⚠️ WARNING: You have no districts selected. You will not receive any regional outbreak alerts or be allowed to file household surveys. Please select at least one district above.
                </p>
              )}
            </div>
          )}

          {/* Profile save controls */}
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 py-3 text-center rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all block"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 py-3 text-center rounded-xl bg-primary-500 hover:bg-primary-600 text-xs font-bold text-white transition-all shadow-md shadow-primary-500/10"
            >
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
