import type { ReportInput, RiskAssessment, RiskLevel, WaterCondition } from "@/types/report";

export function getRiskColor(level: RiskLevel | string): string {
  switch (level) {
    case "HIGH":
      return "#ef4444";
    case "MEDIUM":
      return "#f59e0b";
    case "LOW":
      return "#10b981";
    default:
      return "#94a3b8";
  }
}

export function getRiskBadgeClass(level: RiskLevel | string): string {
  switch (level) {
    case "HIGH":
      return "risk-high";
    case "MEDIUM":
      return "risk-medium";
    case "LOW":
      return "risk-low";
    default:
      return "";
  }
}

export function calculateRisk(
  fever: number,
  diarrhea: number,
  vomiting: number,
  waterContaminated: boolean
): RiskAssessment {
  const weightedSymptoms =
    fever * 2 + diarrhea * 3 + vomiting * 2 + (waterContaminated ? 20 : 0);
  const baseRisk = Math.min(weightedSymptoms * 3.7, 70);
  const featureSum = fever + diarrhea + vomiting + (waterContaminated ? 1 : 0);
  const mlPrediction = featureSum >= 3 ? 1 : 0;
  const finalRisk = Math.min(
    Math.round(baseRisk + (mlPrediction ? 30 : 0)),
    100
  );

  const level: RiskLevel =
    finalRisk >= 80 ? "HIGH" : finalRisk >= 50 ? "MEDIUM" : "LOW";

  return { risk: finalRisk, level, mlPrediction };
}

export function toReportInput<T extends ReportInput>(report: T): ReportInput {
  return {
    village: report.village,
    fever: report.fever,
    diarrhea: report.diarrhea,
    vomiting: report.vomiting,
    waterCondition: report.waterCondition as WaterCondition,
    date: report.date,
  };
}
