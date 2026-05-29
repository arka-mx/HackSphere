import { NextResponse } from "next/server";
import type {
  ApiResponse,
  SyncReportsRequest,
  SyncReportsResponse,
} from "@/types/api";
import type { Report } from "@/types/report";
import { calculateRisk } from "@/utils/helpers";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SyncReportsRequest>;
  const reports = Array.isArray(body.reports) ? body.reports : [];

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
