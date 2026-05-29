export type AlertStatus = "active" | "resolved";

export interface Alert {
  id: number;
  village: string;
  risk: number;
  timestamp: string;
  status: AlertStatus;
}
