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

/**
 * Task: Fetch 10-year daily historical weather from RapidAPI Meteostat
 * Aggregates average temperature, precipitation, pressure, wind, etc.
 */
export async function fetchMeteostatDailyPoint(lat: number, lon: number, startDate: string, endDate: string) {
  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "AIzaSyDU5oYnkvb7cgEtLSqOZ6PPHxkGrTlzL7o";
  const url = `https://meteostat.p.rapidapi.com/point/daily?lat=${lat}&lon=${lon}&start=${startDate}&end=${endDate}&model=true&units=metric`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "meteostat.p.rapidapi.com",
      "x-rapidapi-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Meteostat query failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Free Weather API (Open-Meteo) forecast/current endpoint.
 * Requires no key, completely free.
 */
export async function fetchOpenMeteoWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&timezone=auto`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo query failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
