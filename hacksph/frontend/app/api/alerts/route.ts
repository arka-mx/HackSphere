import { NextResponse } from "next/server";
import { alerts as mockAlerts } from "@/lib/mockData";
import type { AlertsResponse, ApiResponse } from "@/types/api";

export async function GET() {
  const flaskBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  const flaskUrl = `${flaskBaseUrl}/api/alerts`;

  try {
    const response = await fetch(flaskUrl, { 
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const payload = await response.json();
      if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
        const alertsList = payload.data.map((a: any) => ({
          id: a.id,
          village: a.village,
          risk: a.risk_score || a.risk,
          timestamp: a.timestamp,
          status: a.status || "active",
        }));

        return NextResponse.json<ApiResponse<AlertsResponse>>({
          success: true,
          data: {
            alerts: alertsList,
            activeCount: alertsList.filter((a: any) => a.status === "active").length,
          },
        });
      }
    }
  } catch (err: any) {
    console.warn("Flask backend GET /api/alerts connection failed, using local mock fallbacks:", err.message);
  }

  // Fallback case: use local mock alerts when backend down
  const activeCount = mockAlerts.filter((alert) => alert.status === "active").length;
  
  return NextResponse.json<ApiResponse<AlertsResponse>>({
    success: true,
    data: {
      alerts: mockAlerts,
      activeCount,
    },
  });
}
