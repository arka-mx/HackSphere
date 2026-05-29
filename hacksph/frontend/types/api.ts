import type { Alert } from "@/types/alert";
import type { Report, ReportInput, RiskAssessment } from "@/types/report";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ReportSubmissionResponse {
  report: Report;
  assessment: RiskAssessment;
  storedOffline: boolean;
}

export interface SyncReportsRequest {
  reports: ReportInput[];
}

export interface SyncReportsResponse {
  syncedCount: number;
  reports: Report[];
}

export interface AlertsResponse {
  alerts: Alert[];
  activeCount: number;
}
