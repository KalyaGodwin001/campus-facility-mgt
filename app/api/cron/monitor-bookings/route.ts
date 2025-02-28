// app/api/cron/monitor-bookings/route.ts
import { monitorBookings } from "@/utils/bookingMonitor"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await monitorBookings()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in booking monitor:", error)
    return NextResponse.json({ error: "Monitor failed" }, { status: 500 })
  }
}