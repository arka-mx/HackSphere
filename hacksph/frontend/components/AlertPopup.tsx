"use client";

import { useEffect, useState } from "react";
import { fetchAlerts } from "@/lib/api";
import { alerts as mockAlerts } from "@/lib/mockData";
import type { Alert } from "@/types/alert";

export default function AlertPopup() {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const timeouts: number[] = [];

    const queueAlerts = (alerts: Alert[]) => {
      const activeAlerts = alerts.filter((alert) => alert.status === "active");

      activeAlerts.forEach((alert, index) => {
        const timeoutId = window.setTimeout(() => {
          if (!cancelled) {
            setVisibleAlerts((prev) => [...prev, alert]);
          }
        }, index * 2000);

        timeouts.push(timeoutId);
      });
    };

    fetchAlerts()
      .then((response) => queueAlerts(response.alerts))
      .catch(() => queueAlerts(mockAlerts));

    return () => {
      cancelled = true;
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
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
