"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
<<<<<<< HEAD
import { useRole } from "@/lib/RoleContext";
=======
import { loginWithGoogle, logoutUser, getStoredUser, AuthenticatedUser } from "@/lib/firebase";
>>>>>>> 554b177e8092b8889a55c6ea1ee0746cb33d0e45

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
<<<<<<< HEAD
  const { activeRole } = useRole();
=======
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    // Avoid SSR hydration mismatches
    setUser(getStoredUser());

    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("jr_auth_change", handleAuthChange);
    return () => {
      window.removeEventListener("jr_auth_change", handleAuthChange);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
      alert("Sign-in failed. Please verify your Firebase configuration and backend connectivity.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
      alert("Sign-out failed.");
    }
  };
>>>>>>> 554b177e8092b8889a55c6ea1ee0746cb33d0e45

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

          {/* Status Indicator & Google Auth */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-surface-300 capitalize">{activeRole} Mode Active</span>
            </div>
            
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="text-right">
                  <span className="text-xs font-semibold block text-white">{user.name}</span>
                  <span className="text-[10px] block text-primary-400 capitalize font-medium">{user.role} worker</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-surface-200 border border-white/5 transition-all cursor-pointer font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 hover:shadow-lg hover:shadow-primary-500/20 text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-primary-500/10"
              >
                <span>🔑</span> Sign In
              </button>
            )}
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
            mobileOpen ? "max-h-[360px] pb-4" : "max-h-0"
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
            
            <div className="border-t border-white/5 pt-3 mt-2 px-4 flex items-center justify-between">
              {user ? (
                <>
                  <div className="text-left">
                    <span className="text-xs font-semibold block text-white">{user.name}</span>
                    <span className="text-[10px] block text-primary-400 capitalize">{user.role} worker</span>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-surface-300 cursor-pointer border border-white/5"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { handleLogin(); setMobileOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-xs font-semibold text-white cursor-pointer shadow-md"
                >
                  🔑 Sign In with Google
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
