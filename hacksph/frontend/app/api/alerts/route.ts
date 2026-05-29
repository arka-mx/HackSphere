import { NextResponse } from "next/server";
import { alerts } from "@/lib/mockData";
import type { AlertsResponse, ApiResponse } from "@/types/api";

export async function GET() {
  const activeCount = alerts.filter((alert) => alert.status === "active").length;

  return NextResponse.json<ApiResponse<AlertsResponse>>({
    success: true,
    data: {
      alerts,
      activeCount,
    },
  });
}
