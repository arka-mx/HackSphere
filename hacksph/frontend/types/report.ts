export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type WaterCondition = "clean" | "contaminated";

export type LanguageCode = "en" | "hi" | "bn";

export interface LocalizedCopy {
  en: string;
  hi: string;
  bn: string;
}

export interface Village {
  name: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

export interface ReportInput {
  village: string;
  fever: number;
  diarrhea: number;
  vomiting: number;
  waterCondition: WaterCondition;
  date: string;
  symptomSeverityScore?: number;
}

export interface Report extends ReportInput {
  id: number;
  waterNumeric: number;
  riskScore: number;
  mlPrediction: number;
  riskLevel: RiskLevel;
}

export interface RiskAssessment {
  risk: number;
  level: RiskLevel;
  mlPrediction: number;
}

export interface CasesOverTimePoint {
  date: string;
  cases: number;
  highRisk: number;
}

export interface VillageRiskDatum {
  village: string;
  risk: number;
  fill: string;
}

export interface AwarenessCard {
  id: number;
  title: LocalizedCopy;
  body: LocalizedCopy;
  icon: string;
  color: string;
}

export interface IndustrialContaminationLog {
  id: number;
  village: string;
  date: string;
  effluentLevel: "none" | "mild" | "high";
  waterColor: string;
  turbidity: number;
  tds: number;
  ph: number;
  chemicals: string[];
  reportedBy: string;
}

export interface ClinicalCaseRecord {
  id: number;
  village: string;
  date: string;
  clinicName: string;
  choleraCases: number;
  diarrheaCases: number;
  typhoidCases: number;
  malariaCases: number;
  bedOccupancy: number;
  medicineStock: "adequate" | "low" | "critical";
  reportedBy: string;
}

export interface PublicComplaint {
  id: number;
  village: string;
  date: string;
  complainant: string;
  issueType: "smell" | "color" | "sickness" | "other";
  details: string;
  resolved: boolean;
}

