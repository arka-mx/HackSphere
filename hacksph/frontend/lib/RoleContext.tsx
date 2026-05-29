"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  reports as initialReports,
  mockIndustrialLogs as initialIndustrialLogs,
  mockClinicalRecords as initialClinicalRecords,
  mockPublicComplaints as initialPublicComplaints,
  alerts as initialAlerts,
  villages as initialVillages,
} from "@/lib/mockData";
import type {
  Report,
  IndustrialContaminationLog,
  ClinicalCaseRecord,
  PublicComplaint,
  Village,
} from "@/types/report";
import type { Alert } from "@/types/alert";

export type UserRole = "admin" | "asha" | "volunteer" | "public";

interface RoleContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  ashaVillage: string;
  setAshaVillage: (village: string) => void;
  volunteerVillage: string;
  setVolunteerVillage: (village: string) => void;
  volunteerClinic: string;
  setVolunteerClinic: (clinic: string) => void;
  
  // Dynamic mock DB states
  symptomReports: Report[];
  addSymptomReport: (report: Omit<Report, "id" | "waterNumeric" | "riskScore" | "mlPrediction" | "riskLevel">) => void;
  industrialLogs: IndustrialContaminationLog[];
  addIndustrialLog: (log: Omit<IndustrialContaminationLog, "id" | "date" | "reportedBy">) => void;
  clinicalRecords: ClinicalCaseRecord[];
  addClinicalRecord: (record: Omit<ClinicalCaseRecord, "id" | "date" | "reportedBy">) => void;
  publicComplaints: PublicComplaint[];
  addPublicComplaint: (complaint: Omit<PublicComplaint, "id" | "date" | "resolved">) => void;
  
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  resolveAlert: (id: number) => void;
  villagesList: Village[];
  updateVillageRisk: (name: string, score: number, level: "LOW" | "MEDIUM" | "HIGH") => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>("public");
  const [ashaVillage, setAshaVillage] = useState<string>("Sundarbans");
  const [volunteerVillage, setVolunteerVillage] = useState<string>("Bankura");
  const [volunteerClinic, setVolunteerClinic] = useState<string>("Bankura Rural Wellness Subcenter");

  // Dynamic log states
  const [symptomReports, setSymptomReports] = useState<Report[]>(initialReports);
  const [industrialLogs, setIndustrialLogs] = useState<IndustrialContaminationLog[]>(initialIndustrialLogs);
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalCaseRecord[]>(initialClinicalRecords);
  const [publicComplaints, setPublicComplaints] = useState<PublicComplaint[]>(initialPublicComplaints);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [villagesList, setVillagesList] = useState<Village[]>(initialVillages);

  // Load from localStorage on client side mount
  useEffect(() => {
    const savedRole = localStorage.getItem("jr_role") as UserRole;
    if (savedRole) {
      setActiveRoleState(savedRole);
    }
    const savedAshaVillage = localStorage.getItem("jr_asha_village");
    if (savedAshaVillage) setAshaVillage(savedAshaVillage);

    const savedVolunteerVillage = localStorage.getItem("jr_volunteer_village");
    if (savedVolunteerVillage) setVolunteerVillage(savedVolunteerVillage);
  }, []);

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem("jr_role", role);
  };

  const updateVillageRisk = (name: string, score: number, level: "LOW" | "MEDIUM" | "HIGH") => {
    setVillagesList((prev) =>
      prev.map((v) => (v.name === name ? { ...v, riskScore: score, riskLevel: level } : v))
    );
  };

  const addSymptomReport = (reportData: Omit<Report, "id" | "waterNumeric" | "riskScore" | "mlPrediction" | "riskLevel">) => {
    const weightedSymptoms =
      reportData.fever * 2 + reportData.diarrhea * 3 + reportData.vomiting * 2 + (reportData.waterCondition === "contaminated" ? 20 : 0);
    const baseRisk = Math.min(weightedSymptoms * 3.7, 70);
    const featureSum = reportData.fever + reportData.diarrhea + reportData.vomiting + (reportData.waterCondition === "contaminated" ? 1 : 0);
    const mlPrediction = featureSum >= 3 ? 1 : 0;
    const finalRisk = Math.min(Math.round(baseRisk + (mlPrediction ? 30 : 0)), 100);
    const level = finalRisk >= 80 ? "HIGH" : finalRisk >= 50 ? "MEDIUM" : "LOW";

    const newReport: Report = {
      ...reportData,
      id: Date.now(),
      waterNumeric: reportData.waterCondition === "contaminated" ? 1 : 0,
      riskScore: finalRisk,
      mlPrediction,
      riskLevel: level,
    };

    setSymptomReports((prev) => [newReport, ...prev]);
    updateVillageRisk(reportData.village, finalRisk, level);

    // If risk score is high, trigger a new alert automatically
    if (finalRisk >= 80) {
      const newAlert: Alert = {
        id: Date.now(),
        village: reportData.village,
        risk: finalRisk,
        timestamp: new Date().toISOString(),
        status: "active",
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  const addIndustrialLog = (logData: Omit<IndustrialContaminationLog, "id" | "date" | "reportedBy">) => {
    const newLog: IndustrialContaminationLog = {
      ...logData,
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      reportedBy: `ASHA Worker - ${ashaVillage} Sector`,
    };
    setIndustrialLogs((prev) => [newLog, ...prev]);

    // Spiking water pollution risk score
    const currentVillage = villagesList.find((v) => v.name === logData.village);
    if (currentVillage) {
      const newScore = Math.min(currentVillage.riskScore + (logData.effluentLevel === "high" ? 25 : 10), 100);
      const newLevel = newScore >= 80 ? "HIGH" : newScore >= 50 ? "MEDIUM" : "LOW";
      updateVillageRisk(logData.village, newScore, newLevel);
    }
  };

  const addClinicalRecord = (recordData: Omit<ClinicalCaseRecord, "id" | "date" | "reportedBy">) => {
    const newRecord: ClinicalCaseRecord = {
      ...recordData,
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      reportedBy: `Dr. / Clinic Staff (${volunteerClinic})`,
    };
    setClinicalRecords((prev) => [newRecord, ...prev]);

    // Spiking clinical cases risk score
    const currentVillage = villagesList.find((v) => v.name === recordData.village);
    if (currentVillage) {
      const caseWeight = recordData.choleraCases * 4 + recordData.diarrheaCases * 2 + recordData.typhoidCases * 3;
      const riskAdd = Math.min(Math.round(caseWeight * 0.8), 35);
      const newScore = Math.min(currentVillage.riskScore + riskAdd, 100);
      const newLevel = newScore >= 80 ? "HIGH" : newScore >= 50 ? "MEDIUM" : "LOW";
      updateVillageRisk(recordData.village, newScore, newLevel);
    }
  };

  const addPublicComplaint = (complaintData: Omit<PublicComplaint, "id" | "date" | "resolved">) => {
    const newComplaint: PublicComplaint = {
      ...complaintData,
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      resolved: false,
    };
    setPublicComplaints((prev) => [newComplaint, ...prev]);
  };

  const addAlert = (alert: Alert) => {
    setAlerts((prev) => [alert, ...prev]);
  };

  const resolveAlert = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" as const } : a))
    );
  };

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        setActiveRole,
        ashaVillage,
        setAshaVillage: (v) => {
          setAshaVillage(v);
          localStorage.setItem("jr_asha_village", v);
        },
        volunteerVillage,
        setVolunteerVillage: (v) => {
          setVolunteerVillage(v);
          localStorage.setItem("jr_volunteer_village", v);
        },
        volunteerClinic,
        setVolunteerClinic,
        symptomReports,
        addSymptomReport,
        industrialLogs,
        addIndustrialLog,
        clinicalRecords,
        addClinicalRecord,
        publicComplaints,
        addPublicComplaint,
        alerts,
        addAlert,
        resolveAlert,
        villagesList,
        updateVillageRisk,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
