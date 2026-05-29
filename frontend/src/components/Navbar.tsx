"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/report", label: "Report", icon: "📋" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin", label: "Admin", icon: "🛡️" },
  { href: "/awareness", label: "Awareness", icon: "💡" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-${link.label.toLowerCase()}`}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2
                    ${
                      isActive
                        ? "text-primary-400 bg-primary-500/10"
                        : "text-surface-300 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
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
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-surface-300">System Active</span>
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
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
