"use client";

import { useRole } from "@/lib/RoleContext";
import { useState } from "react";

export default function LoginScreen() {
  const { loginWithGoogle, setOnboardingRole } = useRole();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Simulate real Google login popup delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    loginWithGoogle(); // Triggers base Google sign-in onboarding state
    setLoading(false);
  };

  const handleBypass = (role: "admin" | "asha" | "volunteer") => {
    if (role === "admin") {
      setOnboardingRole("admin", [], "Dr. Amit Bauri (Chief Admin)");
    } else if (role === "asha") {
      setOnboardingRole("asha", ["Sundarbans", "Malda"], "Anjali Sen (ASHA worker)");
    } else {
      setOnboardingRole("volunteer", ["Bankura"], "Dr. Biplab Ghosh (Volunteer)");
    }
  };

  const handlePublicGuest = () => {
    setOnboardingRole("public", [], "Public Citizen");
  };

  return (
    <div className="min-h-screen bg-grid relative flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-radial-glow" />

      {/* Login Card */}
      <div className="relative z-10 glass-card rounded-3xl p-8 max-w-md w-full text-center space-y-8 animate-scale-in">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-primary-500/20 text-white animate-float">
            💧
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">JalRakshak</h1>
            <span className="text-[10px] uppercase font-bold text-primary-500 tracking-widest block">Health AI Surveillance</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Combines field-sickness logs with environmental & industrial parameters to predict waterborne epidemics in Rural India.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-sm font-bold text-white transition-all shadow-md shadow-primary-500/10 cursor-pointer disabled:opacity-50"
            id="google-login-btn"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.41 0-6.19-2.779-6.19-6.19s2.78-6.19 6.19-6.19c1.603 0 3.018.614 4.092 1.621l3.11-3.11C19.345 2.871 16.002 1.7 12.24 1.7 6.444 1.7 1.7 6.444 1.7 12.24s4.744 10.54 10.54 10.54c5.795 0 10.54-4.744 10.54-10.54 0-.71-.082-1.393-.223-2.04H12.24z"/>
                </svg>
                Sign In with Google
              </>
            )}
          </button>

          <button
            onClick={handlePublicGuest}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer border border-slate-200"
            id="guest-login-btn"
          >
            👥 Continue as Public Guest (Browse Map)
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Developer Scope Bypasses</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Quick Role Selectors for Evaluators */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "ASHA", role: "asha", icon: "👩‍⚕️" },
            { label: "Clinic", role: "volunteer", icon: "🏥" },
            { label: "Admin", role: "admin", icon: "👑" },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => handleBypass(item.role as any)}
              className="p-2.5 rounded-lg border border-slate-200 hover:border-primary-500/50 hover:bg-primary-50/50 transition-all text-[10px] font-bold text-slate-600 flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
