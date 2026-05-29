import { NextResponse } from "next/server";
import type { ApiResponse, ReportSubmissionResponse } from "@/types/api";
import type { Report } from "@/types/report";
import { calculateRisk } from "@/utils/helpers";

export async function POST(request: Request) {
  const body = await request.json();

  const flaskBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  const flaskUrl = `${flaskBaseUrl}/api/report`;

  try {
    const response = await fetch(flaskUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        village: body.village,
        fever: body.fever,
        diarrhea: body.diarrhea,
        vomiting: body.vomiting,
        water_condition: body.waterCondition || body.water_condition,
        date: body.date,
        symptom_severity_score: body.symptom_severity_score || body.symptomSeverityScore || 3,
      }),
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        const report: Report = {
          id: data.data.id,
          village: data.data.village,
          fever: data.data.fever,
          diarrhea: data.data.diarrhea,
          vomiting: data.data.vomiting,
          waterCondition: data.data.water_condition,
          date: data.data.date,
          waterNumeric: data.data.water_numeric,
          riskScore: data.data.risk_score,
          mlPrediction: data.data.ml_prediction,
          riskLevel: data.data.risk_level,
          symptomSeverityScore: data.data.symptom_severity_score || body.symptomSeverityScore || 3,
        };

        return NextResponse.json<ApiResponse<ReportSubmissionResponse>>({
          success: true,
          data: {
            report,
            assessment: {
              risk: data.data.risk_score,
              level: data.data.risk_level,
              mlPrediction: data.data.ml_prediction === 1,
            },
            storedOffline: false,
          },
        });
      }
    }
  } catch (err: any) {
    console.warn("Flask backend connection failed for POST /report, falling back to local JS model:", err.message);
  }

  // Fallback / Local simulation processing when Flask is offline
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
      storedOffline: true, // Tagged offline fallback
    },
  });
}
