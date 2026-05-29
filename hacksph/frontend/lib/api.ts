import type {
  AlertsResponse,
  ApiResponse,
  ReportSubmissionResponse,
  SyncReportsResponse,
} from "@/types/api";
import type { ReportInput } from "@/types/report";

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed");
  }

  return payload.data;
}

export function submitReport(report: ReportInput) {
  return fetchJson<ReportSubmissionResponse>("/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  });
}

export function syncReports(reports: ReportInput[]) {
  return fetchJson<SyncReportsResponse>("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reports }),
  });
}

export function fetchAlerts() {
  return fetchJson<AlertsResponse>("/api/alerts");
}
