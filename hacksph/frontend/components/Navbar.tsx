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
      return { label: "Home", icon: "🏠" };
    case "/report":
      if (role === "admin") return { label: "Officer Submissions", icon: "🛡️" };
      if (role === "asha") return { label: "ASHA Field Surveys", icon: "📋" };
      if (role === "volunteer") return { label: "Clinical Case Logs", icon: "🏥" };
      return { label: "Community Complaint", icon: "👥" };
    case "/dashboard":
      if (role === "admin") return { label: "Command Center Map", icon: "🗺️" };
      if (role === "asha") return { label: "Contamination Heatmap", icon: "🔥" };
      if (role === "volunteer") return { label: "Clinic Outreach Map", icon: "📊" };
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
  const { activeRole } = useRole();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" id="nav-logo">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
                💧
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary-400 rounded-full animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold gradient-text">JalRakshak</span>
              <span className="text-xs block text-surface-400 -mt-1 tracking-wider">
                HEALTH AI
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const { label, icon } = getNavLinkConfig(link.href, activeRole);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${
                      isActive
                        ? "text-primary-400 bg-primary-500/10"
                        : "text-surface-300 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span className="text-base">{icon}</span>
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-surface-300 capitalize">{activeRole} Mode Active</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            id="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <span
                className={`block h-0.5 bg-surface-300 rounded transition-all duration-300 ${
                  mobileOpen ? "rotate-45 translate-y-[3px]" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-surface-300 rounded transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 bg-surface-300 rounded transition-all duration-300 ${
                  mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? "max-h-80 pb-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const { label, icon } = getNavLinkConfig(link.href, activeRole);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-3
                    ${
                      isActive
                        ? "text-primary-400 bg-primary-500/10"
                        : "text-surface-300 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
