import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"
import { getUserById } from "@/services/userService"
import { getAllRooms } from "@/services/roomService"
import { getAllBookings } from "@/services/bookingService"
import DashboardClient from "./client"

export default async function DashboardPage() {
  const headersList = await headers()
  const token = headersList.get("cookie")?.split("token=")[1]?.split(";")[0]

  if (!token) {
    redirect("/auth/login")
  }

  const payload = await verifyToken(token)
  if (!payload) {
    redirect("/auth/login")
  }

  try {
    const [user, rooms, bookings] = await Promise.all([getUserById(payload.userId), getAllRooms(), getAllBookings()])

    if (!user) {
      redirect("/auth/login")
    }

    return <DashboardClient user={user} initialRooms={rooms} initialBookings={bookings} />
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2">Failed to load dashboard</p>
        </div>
      </div>
    )
  }
}

