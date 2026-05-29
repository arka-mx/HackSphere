// ============================
// Offline Storage Utility
// ============================

const STORAGE_KEY = "jalrakshak_offline_reports";

export interface OfflineReport {
  id: string;
  village: string;
  fever: number;
  diarrhea: number;
  vomiting: number;
  waterCondition: string;
  date: string;
  timestamp: number;
  synced: boolean;
}

export function getOfflineReports(): OfflineReport[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveOfflineReport(report: Omit<OfflineReport, "id" | "timestamp" | "synced">): void {
  const reports = getOfflineReports();
  const newReport: OfflineReport = {
    ...report,
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    synced: false,
  };
  reports.push(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function getUnsyncedReports(): OfflineReport[] {
  return getOfflineReports().filter((r) => !r.synced);
}

export function markAsSynced(ids: string[]): void {
  const reports = getOfflineReports();
  const updated = reports.map((r) =>
    ids.includes(r.id) ? { ...r, synced: true } : r
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearSyncedReports(): void {
  const reports = getOfflineReports().filter((r) => !r.synced);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}
