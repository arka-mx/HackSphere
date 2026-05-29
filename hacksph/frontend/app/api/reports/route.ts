import { NextResponse } from "next/server";
import { reports as mockReports } from "@/lib/mockData";
import type { ApiResponse } from "@/types/api";
import type { Report } from "@/types/report";

export async function GET() {
  const flaskBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  const flaskUrl = `${flaskBaseUrl}/api/reports`;

  try {
    const response = await fetch(flaskUrl, { 
      method: "GET",
      // Set short timeout so offline fallbacks load instant
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const payload = await response.json();
      if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
        const reports: Report[] = payload.data.map((r: any) => ({
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
        }));

        return NextResponse.json<ApiResponse<Report[]>>({
          success: true,
          data: reports,
        });
      }
    }
  } catch (err: any) {
    console.warn("Flask backend GET /reports connection failed, using local mock fallbacks:", err.message);
  }

  // Fallback case 1: use mock initial reports when backend down
  return NextResponse.json<ApiResponse<Report[]>>({
    success: true,
    data: mockReports,
  });
}
