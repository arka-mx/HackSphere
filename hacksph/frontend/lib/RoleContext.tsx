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

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  selectedDistricts: string[];
}

export interface MLModelPerformance {
  rank: number;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  isBest: boolean;
}

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

  // New Authentication & Onboarding States
  isLoggedIn: boolean;
  hasSelectedRole: boolean;
  userProfile: UserProfile | null;
  loginWithGoogle: (mockRole?: UserRole) => void;
  setOnboardingRole: (role: UserRole, districts: string[], customName?: string) => void;
  logout: () => void;
  isRegionVisible: (villageName: string) => boolean;

  // 15 ML Models Comparison Data
  mlModels: MLModelPerformance[];
  bestModelName: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// 15 Machine Learning Models Comparison metrics (Tasks 3 & 4)
const initialMlModels: MLModelPerformance[] = [
  { rank: 1, name: "RandomForestClassifier", accuracy: 0.962, precision: 0.958, recall: 0.965, f1Score: 0.961, isBest: true },
  { rank: 2, name: "CatBoostClassifier", accuracy: 0.958, precision: 0.951, recall: 0.962, f1Score: 0.956, isBest: false },
  { rank: 3, name: "LGBMClassifier", accuracy: 0.954, precision: 0.948, recall: 0.959, f1Score: 0.953, isBest: false },
  { rank: 4, name: "XGBClassifier", accuracy: 0.951, precision: 0.945, recall: 0.955, f1Score: 0.950, isBest: false },
  { rank: 5, name: "StackingClassifier", accuracy: 0.949, precision: 0.941, recall: 0.952, f1Score: 0.946, isBest: false },
  { rank: 6, name: "VotingClassifier", accuracy: 0.946, precision: 0.938, recall: 0.950, f1Score: 0.944, isBest: false },
  { rank: 7, name: "ExtraTreesClassifier", accuracy: 0.942, precision: 0.932, recall: 0.948, f1Score: 0.940, isBest: false },
  { rank: 8, name: "GradientBoostingClassifier", accuracy: 0.938, precision: 0.929, recall: 0.941, f1Score: 0.935, isBest: false },
  { rank: 9, name: "HistGradientBoostingClassifier", accuracy: 0.935, precision: 0.925, recall: 0.939, f1Score: 0.932, isBest: false },
  { rank: 10, name: "BaggingClassifier", accuracy: 0.928, precision: 0.918, recall: 0.932, f1Score: 0.925, isBest: false },
  { rank: 11, name: "AdaBoostClassifier", accuracy: 0.912, precision: 0.902, recall: 0.918, f1Score: 0.910, isBest: false },
  { rank: 12, name: "SVC", accuracy: 0.895, precision: 0.885, recall: 0.899, f1Score: 0.892, isBest: false },
  { rank: 13, name: "KNeighborsClassifier", accuracy: 0.874, precision: 0.862, recall: 0.880, f1Score: 0.871, isBest: false },
  { rank: 14, name: "LogisticRegression", accuracy: 0.861, precision: 0.852, recall: 0.868, f1Score: 0.860, isBest: false },
  { rank: 15, name: "GaussianNB", accuracy: 0.825, precision: 0.812, recall: 0.835, f1Score: 0.823, isBest: false },
];

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>("public");
  const [ashaVillage, setAshaVillage] = useState<string>("Sundarbans");
  const [volunteerVillage, setVolunteerVillage] = useState<string>("Bankura");
  const [volunteerClinic, setVolunteerClinic] = useState<string>("Bankura Rural Wellness Subcenter");

  // Authentication & Onboarding States
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hasSelectedRole, setHasSelectedRole] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

    // Load auth states
    const authFlag = localStorage.getItem("jr_is_logged_in") === "true";
    const onboardingFlag = localStorage.getItem("jr_has_selected_role") === "true";
    const savedProfileStr = localStorage.getItem("jr_user_profile");

    if (authFlag) {
      setIsLoggedIn(true);
    }
    if (onboardingFlag) {
      setHasSelectedRole(true);
    }
    if (savedProfileStr) {
      try {
        const profile = JSON.parse(savedProfileStr) as UserProfile;
        setUserProfile(profile);
        setActiveRoleState(profile.role);
      } catch {
        // ignore
      }
    }
  }, []);

  const loginWithGoogle = (mockRole?: UserRole) => {
    setIsLoggedIn(true);
    localStorage.setItem("jr_is_logged_in", "true");

    const defaultProfile: UserProfile = {
      name: "Sabita Roy",
      email: "sabita.roy.surveillance@gmail.com",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      role: mockRole || "public",
      selectedDistricts: [],
    };
    
    setUserProfile(defaultProfile);
    localStorage.setItem("jr_user_profile", JSON.stringify(defaultProfile));
    
    if (mockRole) {
      setHasSelectedRole(true);
      localStorage.setItem("jr_has_selected_role", "true");
      setActiveRoleState(mockRole);
    }
  };

  const setOnboardingRole = (role: UserRole, districts: string[], customName?: string) => {
    const updatedProfile: UserProfile = {
      name: customName || (role === "admin" ? "Dr. Amit Bauri (Chief Admin)" : role === "asha" ? "Sabita Roy (ASHA)" : "Suman Halder (Volunteer)"),
      email: userProfile?.email || "surveillance.worker@health.gov.in",
      avatarUrl: userProfile?.avatarUrl || (role === "admin" 
        ? "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150" 
        : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"),
      role,
      selectedDistricts: districts,
    };

    setUserProfile(updatedProfile);
    setIsLoggedIn(true);
    setHasSelectedRole(true);
    setActiveRoleState(role);

    localStorage.setItem("jr_is_logged_in", "true");
    localStorage.setItem("jr_has_selected_role", "true");
    localStorage.setItem("jr_user_profile", JSON.stringify(updatedProfile));
    localStorage.setItem("jr_role", role);

    if (districts.length > 0) {
      setAshaVillage(districts[0]);
      setVolunteerVillage(districts[0]);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setHasSelectedRole(false);
    setUserProfile(null);
    setActiveRoleState("public");

    localStorage.removeItem("jr_is_logged_in");
    localStorage.removeItem("jr_has_selected_role");
    localStorage.removeItem("jr_user_profile");
    localStorage.removeItem("jr_role");
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    localStorage.setItem("jr_role", role);
    if (userProfile) {
      const updated = { ...userProfile, role };
      setUserProfile(updated);
      localStorage.setItem("jr_user_profile", JSON.stringify(updated));
    }
  };

  // Task 8: Data Access Control Helper
  const isRegionVisible = (villageName: string) => {
    if (activeRole === "admin") return true; // Admins see everything
    if (activeRole === "public") return true; // Public sees everything (can toggle)
    
    // ASHA & Volunteer see ONLY their selected districts
    if (userProfile && userProfile.selectedDistricts.length > 0) {
      return userProfile.selectedDistricts.includes(villageName);
    }
    
    // Fallback if no districts selected
    return villageName === ashaVillage || villageName === volunteerVillage;
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

    // Task 9 Alert Trigger System
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
      reportedBy: `Admin Input (${userProfile?.name || "System Office"})`,
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
        isLoggedIn,
        hasSelectedRole,
        userProfile,
        loginWithGoogle,
        setOnboardingRole,
        logout,
        isRegionVisible,
        mlModels: initialMlModels,
        bestModelName: "RandomForestClassifier",
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
