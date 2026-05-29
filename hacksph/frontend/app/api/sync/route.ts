import { NextResponse } from "next/server";
import type { ApiResponse, SyncReportsRequest, SyncReportsResponse } from "@/types/api";
import type { Report } from "@/types/report";
import { calculateRisk } from "@/utils/helpers";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SyncReportsRequest>;
  const reports = Array.isArray(body.reports) ? body.reports : [];

  const flaskBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  const flaskUrl = `${flaskBaseUrl}/api/bulk-upload`;

  try {
    const response = await fetch(flaskUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reports: reports.map((r: any) => ({
          village: r.village,
          fever: r.fever,
          diarrhea: r.diarrhea,
          vomiting: r.vomiting,
          water_condition: r.waterCondition || r.water_condition,
          date: r.date,
          symptom_severity_score: r.symptom_severity_score || r.symptomSeverityScore || 3,
        }))
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const payload = await response.json();
      if (payload.success && payload.summary) {
        const syncedReports: Report[] = payload.summary.reports.map((r: any) => ({
          id: r.id,
          village: r.village,
          fever: r.fever,
          diarrhea: r.diarrhea,
          vomiting: r.vomiting,
          waterCondition: r.water_condition,
          date: r.date,
          waterNumeric: r.water_numeric,
          riskScore: r.risk_score,
          mlPrediction: r.ml_prediction,
          riskLevel: r.risk_level,
          symptomSeverityScore: r.symptom_severity_score || 3,
        }));

        return NextResponse.json<ApiResponse<SyncReportsResponse>>({
          success: true,
          data: {
            syncedCount: syncedReports.length,
            reports: syncedReports,
          },
        });
      }
    }
  } catch (err: any) {
    console.warn("Flask backend POST /bulk-upload connection failed, doing local simulation sync:", err.message);
  }

  // Local sync fallback simulation when Flask down or offline
  const syncedReports: Report[] = reports.map((report, index) => {
    const assessment = calculateRisk(
      report.fever,
      report.diarrhea,
      report.vomiting,
      report.waterCondition === "contaminated"
    );

    return {
      id: Date.now() + index,
      village: report.village,
      fever: report.fever,
      diarrhea: report.diarrhea,
      vomiting: report.vomiting,
      waterCondition: report.waterCondition,
      date: report.date,
      waterNumeric: report.waterCondition === "contaminated" ? 1 : 0,
      riskScore: assessment.risk,
      mlPrediction: assessment.mlPrediction,
      riskLevel: assessment.level,
    };
  });

  return NextResponse.json<ApiResponse<SyncReportsResponse>>({
    success: true,
    data: {
      syncedCount: syncedReports.length,
      reports: syncedReports,
    },
  });
}
