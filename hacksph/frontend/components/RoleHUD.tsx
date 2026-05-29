"use client";

import { useRole, UserRole } from "@/lib/RoleContext";
import { useState } from "react";

const rolesConfig: { role: UserRole; label: string; icon: string; desc: string; color: string }[] = [
  {
    role: "public",
    label: "Public Citizen",
    icon: "👥",
    desc: "Browse heatmaps, lookup district health reports & read safety checklists.",
    color: "from-blue-500/20 to-indigo-500/20 border-indigo-500/30 text-indigo-400",
  },
  {
    role: "asha",
    label: "ASHA Worker",
    icon: "👩‍⚕️",
    desc: "Submit village surveys & feed industrial contamination observations.",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  },
  {
    role: "volunteer",
    label: "Clinic / Volunteer",
    icon: "🏥",
    desc: "Submit medical admission reports & track clinical cases.",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  },
  {
    role: "admin",
    label: "Health Admin",
    icon: "👑",
    desc: "High-level overview control room, AI risk triggers, & alerts management.",
    color: "from-danger-500/20 to-rose-500/20 border-danger-500/30 text-danger-400",
  },
];

export default function RoleHUD() {
  const { activeRole, setActiveRole, ashaVillage, volunteerVillage, volunteerClinic } = useRole();
  const [collapsed, setCollapsed] = useState(false);

  const currentRoleObj = rolesConfig.find((r) => r.role === activeRole) || rolesConfig[0];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-scale-in">
      <div className="glass-card rounded-2xl p-3 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Subtle glowing backdrop matching role */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentRoleObj.color} opacity-5 blur-xl pointer-events-none`} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 z-10 relative">
          {/* Active Role Meta */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shadow-inner flex-shrink-0">
              {currentRoleObj.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-surface-400 font-bold uppercase tracking-widest">Active Role</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping" />
              </div>
              <h4 className="text-sm font-bold text-white leading-tight">
                {currentRoleObj.label}
                <span className="text-xs font-normal text-surface-400 ml-2">
                  {activeRole === "asha" && `(Scope: ${ashaVillage})`}
                  {activeRole === "volunteer" && `(Scope: ${volunteerVillage} Clinic)`}
                  {activeRole === "admin" && "(Scope: All Districts)"}
                  {activeRole === "public" && "(Scope: Public Portal)"}
                </span>
              </h4>
            </div>
          </div>

          {/* Role Pill Switcher */}
          <div className="flex items-center justify-between md:justify-end gap-1 bg-surface-950/80 rounded-xl p-1 border border-white/5 w-full md:w-auto overflow-x-auto">
            {rolesConfig.map((item) => {
              const isActive = activeRole === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => setActiveRole(item.role)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex-shrink-0
                    ${
                      isActive
                        ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 scale-105"
                        : "text-surface-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">
                    {item.role === "public" ? "Citizen" : item.role === "asha" ? "ASHA" : item.role === "volunteer" ? "Clinic" : "Admin"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Info Strip */}
        {!collapsed && (
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-surface-400 px-1 animate-fade-in">
            <p className="flex-1 pr-4">
              <span className="font-semibold text-white">Perspective Rule:</span> {currentRoleObj.desc}
            </p>
            <button
              onClick={() => setCollapsed(true)}
              className="hover:text-white transition-colors uppercase tracking-wider font-bold"
            >
              Hide tips
            </button>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-end mt-1">
            <button
              onClick={() => setCollapsed(false)}
              className="text-[9px] text-surface-500 hover:text-surface-300 font-bold uppercase tracking-wider"
            >
              Show tips
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
