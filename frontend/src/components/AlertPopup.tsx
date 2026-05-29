"use client";

import { useEffect, useState } from "react";
import { alerts as mockAlerts, type Alert } from "@/lib/mockData";

export default function AlertPopup() {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Show active alerts one by one with a delay
    const activeAlerts = mockAlerts.filter((a) => a.status === "active");
    let index = 0;

    const interval = setInterval(() => {
      if (index < activeAlerts.length) {
        setVisibleAlerts((prev) => [...prev, activeAlerts[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const dismiss = (id: number) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const activeVisible = visibleAlerts.filter((a) => !dismissed.has(a.id));

  if (activeVisible.length === 0) return null;

  return (
    <div className="alert-popup flex flex-col gap-3 max-w-sm" id="alert-popup-container">
      {activeVisible.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className="glass-card rounded-xl p-4 border-l-4 border-danger-500 animate-scale-in"
          id={`alert-${alert.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-danger-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-danger-400">
                  Outbreak Alert
                </span>
              </div>
              <p className="text-sm font-semibold text-white">
                ⚠️ {alert.village}
              </p>
              <p className="text-xs text-surface-400 mt-0.5">
                Risk Score: <span className="text-danger-400 font-bold">{alert.risk}%</span>
              </p>
              <p className="text-xs text-surface-500 mt-1">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              className="text-surface-500 hover:text-white transition-colors p-1"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
