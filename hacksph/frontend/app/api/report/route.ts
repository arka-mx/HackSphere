import { NextResponse } from "next/server";
import type { ApiResponse, ReportSubmissionResponse } from "@/types/api";
import type { Report, ReportInput } from "@/types/report";
import { calculateRisk } from "@/utils/helpers";

function isReportInput(value: unknown): value is ReportInput {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.village === "string" &&
    typeof candidate.fever === "number" &&
    typeof candidate.diarrhea === "number" &&
    typeof candidate.vomiting === "number" &&
    (candidate.waterCondition === "clean" ||
      candidate.waterCondition === "contaminated") &&
    typeof candidate.date === "string"
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!isReportInput(body)) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        data: null,
        message: "Invalid report payload",
      },
      { status: 400 }
    );
  }

  const assessment = calculateRisk(
    body.fever,
    body.diarrhea,
    body.vomiting,
    body.waterCondition === "contaminated"
  );

  const report: Report = {
    id: Date.now(),
    ...body,
    waterNumeric: body.waterCondition === "contaminated" ? 1 : 0,
    riskScore: assessment.risk,
    mlPrediction: assessment.mlPrediction,
    riskLevel: assessment.level,
  };

  return NextResponse.json<ApiResponse<ReportSubmissionResponse>>({
    success: true,
    data: {
      report,
      assessment,
      storedOffline: false,
    },
  });
}
