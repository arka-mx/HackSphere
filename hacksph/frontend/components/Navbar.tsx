"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/lib/RoleContext";

const navLinks = [
  { href: "/" },
  { href: "/report" },
  { href: "/dashboard" },
  { href: "/admin" },
  { href: "/awareness" },
];

function getNavLinkConfig(href: string, role: string) {
  switch (href) {
    case "/":
      return { label: "Overview", icon: "🏠" };
    case "/report":
      if (role === "admin") return { label: "Environmental Logger", icon: "🛡️" };
      if (role === "asha" || role === "volunteer") return { label: "ASHA / Volunteer Portal", icon: "📋" };
      return { label: "Community Complaint", icon: "👥" };
    case "/dashboard":
      if (role === "admin") return { label: "Command Center Map", icon: "🗺️" };
      if (role === "asha" || role === "volunteer") return { label: "Outbreak Hazard Map", icon: "🗺️" };
      return { label: "Safe Districts Map", icon: "💧" };
    case "/admin":
      if (role === "admin") return { label: "Control Panel", icon: "🛡️" };
      return { label: "Officer Portal", icon: "🔒" };
    case "/awareness":
      if (role === "public") return { label: "Water Safety Guides", icon: "💡" };
      return { label: "Hygiene Awareness", icon: "💡" };
    default:
      return { label: "", icon: "" };
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeRole, userProfile, logout } = useRole();

  const visibleLinks = navLinks.filter((link) => {
    if (activeRole === "admin") {
      return true;
    }
    if (activeRole === "asha" || activeRole === "volunteer") {
      return link.href !== "/admin";
    }
    if (activeRole === "public") {
      return link.href !== "/admin" && link.href !== "/report";
    }
    return true;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group" id="nav-logo">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center text-lg font-bold text-white shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-shadow">
                💧
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 block tracking-tight -mb-0.5">JalRakshak</span>
              <span className="text-[9px] uppercase font-bold text-primary-500 tracking-widest block">
                HEALTH AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;
              const { label, icon } = getNavLinkConfig(link.href, activeRole);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5
                    ${
                      isActive
                        ? "text-primary-500 bg-primary-50 border border-primary-100"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }
                  `}
                >
                  <span className="text-sm">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>

          {/* User Profile / Status Indicator on Right */}
          <div className="hidden md:flex items-center gap-4">
            {userProfile ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-3 hover:opacity-85 transition-all" title="Edit Profile">
                  {/* Profile Meta Details */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block leading-tight">{userProfile.name}</span>
                    <div className="flex gap-1 items-center justify-end mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize leading-none
                        ${
                          activeRole === "admin" ? "bg-danger-50 text-danger-500 border border-danger-100" :
                          (activeRole === "asha" || activeRole === "volunteer") ? "bg-emerald-50 text-emerald-500 border border-emerald-100" :
                          "bg-indigo-50 text-indigo-500 border border-indigo-100"
                        }`}
                      >
                        {(activeRole === "asha" || activeRole === "volunteer") ? "ASHA / Volunteer" : activeRole}
                      </span>
                    </div>
                  </div>
                  
                  {/* Google Avatar Image */}
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                </Link>

                {/* Sign Out Button */}
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-all ml-1"
                  title="Sign Out"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-semibold">Active Session</span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            id="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
              <span className={`block h-0.5 bg-slate-600 rounded transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[4px]" : ""}`} />
              <span className={`block h-0.5 bg-slate-600 rounded transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-slate-600 rounded transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[4px]" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-[300px] pb-4" : "max-h-0"}`}>
          <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;
              const { label, icon } = getNavLinkConfig(link.href, activeRole);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-3
                    ${
                      isActive
                        ? "text-primary-500 bg-primary-50 border border-primary-100"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }
                  `}
                >
                  <span className="text-sm">{icon}</span>
                  {label}
                </Link>
              );
            })}

            {/* Mobile User Profile Info */}
            {userProfile && (
              <div className="border-t border-slate-100 pt-3 mt-2 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-left">
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-bold block text-slate-800">{userProfile.name}</span>
                    <span className="text-[9px] block text-primary-500 capitalize font-bold leading-none mt-0.5">{activeRole} profile</span>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="px-2.5 py-1.5 text-[10px] rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold border border-slate-200 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
