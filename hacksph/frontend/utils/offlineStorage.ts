import type { ReportInput } from "@/types/report";

const STORAGE_KEY = "jalrakshak_offline_reports";

export interface OfflineReport extends ReportInput {
  id: string;
  timestamp: number;
  synced: boolean;
}

export function getOfflineReports(): OfflineReport[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as OfflineReport[]) : [];
  } catch {
    return [];
  }
}

export function saveOfflineReport(report: ReportInput): OfflineReport {
  const reports = getOfflineReports();
  const newReport: OfflineReport = {
    ...report,
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    timestamp: Date.now(),
    synced: false,
  };

  reports.push(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

  return newReport;
}

export function getUnsyncedReports(): OfflineReport[] {
  return getOfflineReports().filter((report) => !report.synced);
}

export function markAsSynced(ids: string[]): void {
  const reports = getOfflineReports();
  const updated = reports.map((report) =>
    ids.includes(report.id) ? { ...report, synced: true } : report
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearSyncedReports(): void {
  const reports = getOfflineReports().filter((report) => !report.synced);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}
